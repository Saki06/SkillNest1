import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Stomp } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import API from '../../api/axios';
import { toast } from 'react-toastify';
import { Send, X, Trash2, Edit2 } from 'lucide-react';
import _ from 'lodash';

const Chat = ({ currentUserId, onClose }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [stompClient, setStompClient] = useState(null);
  const [typingStatus, setTypingStatus] = useState(false);
  const [editingMessage, setEditingMessage] = useState(null);
  const [editContent, setEditContent] = useState('');
  const [pendingMessages, setPendingMessages] = useState(new Map());
  const messagesEndRef = useRef(null);
  const typingTimeout = useRef(null);
  const navigate = useNavigate();

  const debouncedHandleTyping = useRef(
    _.debounce((client, userId, recipientId) => {
      if (client?.connected && recipientId) {
        client.send(
          '/app/chat.typing',
          {},
          JSON.stringify({
            senderId: userId,
            recipientId: recipientId,
            isTyping: true,
          })
        );
      }
    }, 500)
  ).current;

  useEffect(() => {
    if (!currentUserId) {
      toast.error('User ID is missing. Please log in again.');
      navigate('/login');
      return;
    }

    const socket = new SockJS('http://localhost:8000/chat');
    const client = Stomp.over(socket);

    client.connect(
      {},
      () => {
        console.log('WebSocket connected for user:', currentUserId);
        setStompClient(client);

        client.subscribe(`/user/${currentUserId}/topic/messages`, (message) => {
          const receivedMessage = JSON.parse(message.body);
          const messageKey = `${receivedMessage.senderId}-${receivedMessage.content}-${new Date(receivedMessage.timestamp).getTime()}`;
          setPendingMessages((prev) => {
            const newPending = new Map(prev);
            if (newPending.get(messageKey)?.isDeleted) {
              return newPending;
            }
            newPending.delete(messageKey);
            return newPending;
          });

          setMessages((prev) => {
            const updatedMessages = prev.filter(
              (msg) =>
                !msg.isTemporary ||
                msg.senderId !== receivedMessage.senderId ||
                msg.content !== receivedMessage.content ||
                new Date(msg.timestamp).getTime() !== new Date(receivedMessage.timestamp).getTime()
            );
            if (!pendingMessages.get(messageKey)?.isDeleted) {
              return [...updatedMessages, { ...receivedMessage, isRead: receivedMessage.isRead || false }];
            }
            return updatedMessages;
          });
        });

        client.subscribe(`/user/${currentUserId}/topic/read-status`, (message) => {
          const seenMessage = JSON.parse(message.body);
          setMessages((prev) =>
            prev.map((msg) => (msg.id === seenMessage.id ? { ...msg, isRead: true } : msg))
          );
        });

        client.subscribe(`/user/${currentUserId}/topic/typing`, (message) => {
          const { senderId, isTyping } = JSON.parse(message.body);
          if (selectedUser?.id === senderId) {
            setTypingStatus(isTyping);
            clearTimeout(typingTimeout.current);
            typingTimeout.current = setTimeout(() => setTypingStatus(false), 3000);
          }
        });

        client.subscribe(`/user/${currentUserId}/topic/message-deleted`, (message) => {
          const deletedMessageId = message.body;
          setMessages((prev) => prev.filter((msg) => msg.id !== deletedMessageId));
        });

        client.subscribe(`/user/${currentUserId}/topic/message-updated`, (message) => {
          const updatedMessage = JSON.parse(message.body);
          setMessages((prev) =>
            prev.map((msg) => (msg.id === updatedMessage.id ? updatedMessage : msg))
          );
        });
      },
      (error) => {
        console.error('WebSocket connection error:', error);
        toast.error('Failed to connect to chat server. Retrying...');
        setTimeout(
          () => client.connect({}, () => console.log('WebSocket reconnected for user:', currentUserId)),
          5000
        );
      }
    );

    return () => {
      if (client?.connected) {
        client.disconnect(() => console.log('WebSocket disconnected'));
      }
    };
  }, [currentUserId, navigate]);

  useEffect(() => {
    const fetchUsersAndLastMessages = async () => {
      try {
        const response = await API.get('/auth/users');
        const filteredUsers = response.data.filter((user) => user.id !== currentUserId);

        const usersWithLastMessage = await Promise.all(
          filteredUsers.map(async (user) => {
            try {
              const conversationResponse = await API.get(`/messages/conversation`, {
                params: { userId: currentUserId, otherUserId: user.id },
              });
              const conversationMessages = conversationResponse.data;
              const lastMessage = conversationMessages.length > 0 ? conversationMessages[conversationMessages.length - 1] : null;
              return { ...user, lastMessage };
            } catch (err) {
              console.error(`Failed to load conversation for user ${user.id}:`, err);
              return { ...user, lastMessage: null };
            }
          })
        );

        setUsers(usersWithLastMessage);
      } catch (err) {
        console.error('Error fetching users:', err);
        toast.error('Failed to load users');
      }
    };
    fetchUsersAndLastMessages();
  }, [currentUserId, messages]);

  useEffect(() => {
    if (selectedUser) {
      const fetchConversation = async () => {
        try {
          const response = await API.get(`/messages/conversation`, {
            params: { userId: currentUserId, otherUserId: selectedUser.id },
          });
          setMessages(response.data.map((msg) => ({ ...msg, isTemporary: false })));

          response.data.forEach((msg) => {
            if (msg.recipientId === currentUserId && !msg.isRead) {
              API.put(`/messages/read/${msg.id}`).catch((err) =>
                console.error(`Failed to mark message ${msg.id} as read:`, err)
              );
            }
          });
        } catch (err) {
          console.error('Error fetching conversation:', err);
          toast.error('Failed to load conversation');
        }
      };
      fetchConversation();
    }
  }, [selectedUser, currentUserId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedUser || !stompClient?.connected) {
      toast.error('Cannot send message: missing input, recipient, or connection.');
      return;
    }
  
    const tempId = `temp-${Date.now()}`;
    const tempMessage = {
      id: tempId,
      senderId: currentUserId,
      recipientId: selectedUser.id,
      content: newMessage,
      timestamp: new Date(),
      isRead: false,
      isTemporary: true,
      isDeleted: false,
      isEdited: false,
    };
  
    setMessages((prev) => [...prev, tempMessage]);
    setNewMessage('');
  
    try {
      // Save to backend first
      const response = await API.post('/messages/save', {
        senderId: tempMessage.senderId,
        recipientId: tempMessage.recipientId,
        content: tempMessage.content,
      });
  
      const savedMessage = response.data;
  
      // Replace temporary with saved one
      setMessages((prev) =>
        prev.map((msg) => (msg.id === tempId ? savedMessage : msg))
      );
  
      // Send via WebSocket
      stompClient.send('/app/chat.send', {}, JSON.stringify(savedMessage));
    } catch (err) {
      console.error('Send message error:', err);
      toast.error('Failed to send message');
      setMessages((prev) => prev.filter((msg) => msg.id !== tempId));
    }
  };
  
  const editMessage = async (messageId) => {
    if (!editContent.trim()) {
      toast.error('Message content cannot be empty');
      return;
    }

    const messageToEdit = messages.find((msg) => msg.id === messageId);
    if (!messageToEdit) {
      toast.error('Message not found');
      return;
    }

    if (messageToEdit.isTemporary) {
      const messageKey = `${messageToEdit.senderId}-${messageToEdit.content}-${new Date(messageToEdit.timestamp).getTime()}`;
      const newMessageKey = `${messageToEdit.senderId}-${editContent}-${new Date(messageToEdit.timestamp).getTime()}`;
      setPendingMessages((prev) => {
        const newPending = new Map(prev);
        newPending.delete(messageKey);
        newPending.set(newMessageKey, { ...messageToEdit, content: editContent, isEdited: true });
        return newPending;
      });
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === messageId ? { ...msg, content: editContent, isEdited: true } : msg
        )
      );
      if (stompClient?.connected) {
        const { id, isTemporary, isDeleted, isEdited, ...messageToSend } = messageToEdit;
        const updatePayload = { ...messageToSend, tempId: messageId, content: editContent };
        stompClient.send('/app/chat.updateTemp', {}, JSON.stringify(updatePayload));
        console.log('Sent updateTemp for tempId:', messageId, 'with content:', editContent);
      } else {
        toast.error('Cannot update message: WebSocket not connected');
      }
      setEditingMessage(null);
      setEditContent('');
    } else {
      try {
        const updatedMessage = { content: editContent };
        const response = await API.put(`/messages/${messageId}`, updatedMessage);
        setMessages((prev) =>
          prev.map((msg) => (msg.id === messageId ? { ...response.data } : msg))
        );
        setEditingMessage(null);
        setEditContent('');
      } catch (err) {
        console.error('Edit message error:', err);
        toast.error('Failed to edit message');
      }
    }
  };

  const startEditing = (message) => {
    setEditingMessage(message);
    setEditContent(message.content);
  };

  const cancelEditing = () => {
    setEditingMessage(null);
    setEditContent('');
  };

  const deleteMessage = async (messageId) => {
    if (!messageId) {
      toast.error('Invalid message ID');
      return;
    }

    const messageToDelete = messages.find((msg) => msg.id === messageId);
    if (!messageToDelete) {
      toast.error('Message not found');
      return;
    }

    setMessages((prev) => prev.filter((msg) => msg.id !== messageId));

    if (messageToDelete.isTemporary) {
      const messageKey = `${messageToDelete.senderId}-${messageToDelete.content}-${new Date(messageToDelete.timestamp).getTime()}`;
      setPendingMessages((prev) => {
        const newPending = new Map(prev);
        newPending.set(messageKey, { ...newPending.get(messageKey), isDeleted: true });
        return newPending;
      });

      if (stompClient?.connected) {
        const cancelPayload = {
          tempId: messageToDelete.id,
          senderId: currentUserId,
          recipientId: messageToDelete.recipientId,
          timestamp: messageToDelete.timestamp.toISOString(),
        };
        stompClient.send('/app/chat.cancel', {}, JSON.stringify(cancelPayload));
        console.log('Sent cancel for tempId:', messageToDelete.id);
      } else {
        toast.error('Cannot cancel message: WebSocket not connected');
      }
      toast.success('Pending message removed');
    } else {
      try {
        await API.delete(`/messages/${messageId}`);
        toast.success('Message deleted');
      } catch (err) {
        console.error('Delete message error:', err);
        toast.error('Failed to delete message');
        setMessages((prev) => [...prev, messageToDelete]);
      }
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (editingMessage) {
        editMessage(editingMessage.id);
      } else {
        sendMessage();
      }
    }
  };

  const handleTyping = () => {
    debouncedHandleTyping(stompClient, currentUserId, selectedUser?.id);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white w-full max-w-4xl h-[80vh] rounded-lg shadow-xl flex">
        <div className="w-1/3 border-r border-gray-200 overflow-y-auto">
          <div className="p-4 border-b border-gray-200 flex justify-between items-center">
            <h2 className="text-lg font-semibold">Messages</h2>
            <button onClick={onClose} className="text-gray-600 hover:text-gray-800">
              <X size={20} />
            </button>
          </div>
          {users.map((user) => (
            <div
              key={user.id}
              className={`p-4 flex items-center gap-3 cursor-pointer hover:bg-gray-100 ${
                selectedUser?.id === user.id ? 'bg-gray-100' : ''
              }`}
              onClick={() => setSelectedUser(user)}
            >
              <img
                src={user.profileImage || '/assets/avatar.png'}
                alt={user.name}
                className="w-10 h-10 rounded-full object-cover"
              />
              <div className="flex-1">
                <p className="font-medium">{user.name}</p>
                <p className="text-sm text-gray-500 truncate">
                  {user.lastMessage?.content || 'No messages yet'}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="w-2/3 flex flex-col">
          {selectedUser ? (
            <>
              <div className="p-4 border-b border-gray-200 flex items-center gap-3">
                <img
                  src={selectedUser.profileImage || '/assets/avatar.png'}
                  alt={selectedUser.name}
                  className="w-10 h-10 rounded-full object-cover"
                />
                <div>
                  <p className="font-medium">{selectedUser.name}</p>
                  <p className="text-sm text-gray-500">{typingStatus ? 'Typing...' : 'Online'}</p>
                </div>
              </div>

              <div className="flex-1 p-4 overflow-y-auto">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`mb-4 flex ${msg.senderId === currentUserId ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[70%] p-3 rounded-lg ${
                        msg.senderId === currentUserId ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-800'
                      } ${msg.isTemporary ? 'opacity-70' : ''}`}
                    >
                      <p>
                        {msg.content}{' '}
                        {msg.isEdited && <span className="text-xs opacity-75">(Edited)</span>}
                      </p>
                      <div className="flex justify-between items-center mt-1">
                        <p className="text-xs opacity-75">
                          {new Date(msg.timestamp).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </p>
                        {msg.senderId === currentUserId && (
                          <div className="flex gap-2">
                            <button
                              onClick={() => startEditing(msg)}
                              className="text-blue-300 hover:text-blue-100"
                              title="Edit message"
                            >
                              <Edit2 size={16} />
                            </button>
                            <button
                              onClick={() => deleteMessage(msg.id)}
                              className="text-red-300 hover:text-red-100"
                              title="Delete message"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        )}
                      </div>
                      {msg.isRead && !msg.isTemporary && (
                        <p className="text-xs text-green-300 text-right mt-1">Seen</p>
                      )}
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              <div className="p-4 border-t border-gray-200">
                {editingMessage ? (
                  <div className="flex items-center gap-2">
                    <textarea
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Edit your message..."
                      className="flex-1 p-2 border border-gray-300 rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                      rows={2}
                    />
                    <button
                      onClick={() => editMessage(editingMessage.id)}
                      className="p-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                    >
                      Save
                    </button>
                    <button
                      onClick={cancelEditing}
                      className="p-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <textarea
                      value={newMessage}
                      onChange={(e) => {
                        setNewMessage(e.target.value);
                        handleTyping();
                      }}
                      onKeyPress={handleKeyPress}
                      placeholder="Type a message..."
                      className="flex-1 p-2 border border-gray-300 rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                      rows={2}
                    />
                    <button
                      onClick={sendMessage}
                      disabled={!newMessage.trim()}
                      className="p-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:bg-blue-300"
                    >
                      <Send size={20} />
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <p className="text-gray-500">Select a user to start chatting</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Chat;