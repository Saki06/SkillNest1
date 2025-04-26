import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Stomp } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import API from '../../api/axios';
import { toast } from 'react-toastify';
import { Send, X, Trash2, Edit2 } from 'lucide-react';

const Chat = ({ currentUserId, onClose }) => {
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [selectedUser, setSelectedUser] = useState(null);
    const [users, setUsers] = useState([]);
    const [stompClient, setStompClient] = useState(null);
    const [typingStatus, setTypingStatus] = useState(false);
    const [editingMessage, setEditingMessage] = useState(null); // Track message being edited
    const [editContent, setEditContent] = useState(''); // Track edited content
    const messagesEndRef = useRef(null);
    const typingTimeout = useRef(null);

    const navigate = useNavigate();

    useEffect(() => {
        const socket = new SockJS('http://localhost:8000/chat');
        const client = Stomp.over(socket);

        client.connect({}, () => {
            console.log('WebSocket connected for user:', currentUserId);
            
            // Subscription for incoming messages
            client.subscribe(`/user/${currentUserId}/topic/messages`, (message) => {
                const receivedMessage = JSON.parse(message.body);
                setMessages((prev) => {
                    // Replace temporary message if exists, otherwise add new message
                    const updatedMessages = prev.filter(msg => 
                        !msg.isTemporary || 
                        msg.senderId !== receivedMessage.senderId || 
                        msg.content !== receivedMessage.content
                    );
                    return [...updatedMessages, { ...receivedMessage, isRead: receivedMessage.isRead || false }];
                });
            });

            // Subscription for read receipts
            client.subscribe(`/user/${currentUserId}/topic/read-status`, (message) => {
                const seenMessage = JSON.parse(message.body);
                setMessages((prev) =>
                    prev.map((msg) =>
                        msg.id === seenMessage.id ? { ...msg, isRead: true } : msg
                    )
                );
            });

            // Subscription for typing indicators
            client.subscribe(`/user/${currentUserId}/topic/typing`, (message) => {
                const { senderId, isTyping } = JSON.parse(message.body);
                if (selectedUser?.id === senderId) {
                    setTypingStatus(isTyping);
                    clearTimeout(typingTimeout.current);
                    typingTimeout.current = setTimeout(() => setTypingStatus(false), 3000);
                }
            });

            // Subscription for deleted messages
            client.subscribe(`/user/${currentUserId}/topic/message-deleted`, (message) => {
                const deletedMessageId = message.body;
                setMessages((prev) => prev.filter(msg => msg.id !== deletedMessageId));
            });

            // Subscription for updated messages
            client.subscribe(`/user/${currentUserId}/topic/message-updated`, (message) => {
                const updatedMessage = JSON.parse(message.body);
                setMessages((prev) =>
                    prev.map((msg) =>
                        msg.id === updatedMessage.id ? updatedMessage : msg
                    )
                );
            });
        }, (error) => {
            console.error('WebSocket connection error:', error);
            toast.error('Failed to connect to chat server');
        });

        setStompClient(client);

        return () => {
            if (client) {
                client.disconnect();
            }
        };
    }, [currentUserId, selectedUser]);

    useEffect(() => {
        const fetchUsersAndLastMessages = async () => {
            try {
                const response = await API.get('/auth/users');
                const filteredUsers = response.data.filter(user => user.id !== currentUserId);

                const usersWithLastMessage = await Promise.all(
                    filteredUsers.map(async (user) => {
                        try {
                            const conversationResponse = await API.get(`/messages/conversation`, {
                                params: {
                                    userId: currentUserId,
                                    otherUserId: user.id
                                }
                            });
                            const conversationMessages = conversationResponse.data;
                            const lastMessage = conversationMessages.length > 0
                                ? conversationMessages[conversationMessages.length - 1]
                                : null;
                            return { ...user, lastMessage };
                        } catch (err) {
                            console.error(`Failed to load conversation for user ${user.id}:`, err);
                            return { ...user, lastMessage: null };
                        }
                    })
                );

                setUsers(usersWithLastMessage);
            } catch (err) {
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
                        params: {
                            userId: currentUserId,
                            otherUserId: selectedUser.id
                        }
                    });
                    setMessages(response.data);

                    // Mark messages as read
                    response.data.forEach(msg => {
                        if (msg.recipientId === currentUserId && !msg.isRead) {
                            API.put(`/messages/read/${msg.id}`);
                        }
                    });
                } catch (err) {
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
        if (!newMessage.trim() || !selectedUser || !stompClient) return;

        // Create temporary message with client-generated ID
        const tempMessage = {
            id: `temp-${Date.now()}`,
            senderId: currentUserId,
            recipientId: selectedUser.id,
            content: newMessage,
            timestamp: new Date().toISOString(),
            isRead: false,
            isTemporary: true
        };

        // Add temporary message immediately
        setMessages(prev => [...prev, tempMessage]);
        setNewMessage('');

        try {
            // Prepare message for server (without temporary fields)
            const { id, isTemporary, ...messageToSend } = tempMessage;
            stompClient.send('/app/chat.send', {}, JSON.stringify(messageToSend));
        } catch (err) {
            console.error('Send message error:', err);
            toast.error('Failed to send message');
            // Remove temporary message if sending fails
            setMessages(prev => prev.filter(msg => msg.id !== tempMessage.id));
        }
    };

    const editMessage = async (messageId) => {
        if (!editContent.trim()) {
            toast.error('Message content cannot be empty');
            return;
        }
    
        const messageToEdit = messages.find(msg => msg.id === messageId);
        if (!messageToEdit) {
            toast.error('Message not found');
            return;
        }
    
        if (messageToEdit.isTemporary) {
            // ✅ Update temporary message locally
            const updatedTempMessage = {
                ...messageToEdit,
                content: editContent,
                isEdited: true
            };
    
            setMessages(prev =>
                prev.map(msg =>
                    msg.id === messageId ? updatedTempMessage : msg
                )
            );
    
            // ✅ Re-send the updated message via WebSocket
            try {
                const { id, isTemporary, ...messageToSend } = updatedTempMessage;
                stompClient.send('/app/chat.send', {}, JSON.stringify(messageToSend));
            } catch (err) {
                console.error('Resend edited temp message error:', err);
                toast.error('Failed to resend edited message');
            }
    
            setEditingMessage(null);
            setEditContent('');
        } else {
            // ✅ Handle confirmed messages normally
            try {
                const updatedMessage = {
                    ...messageToEdit,
                    content: editContent,
                    isEdited: true
                };
    
                const response = await API.put(`/messages/${messageId}`, updatedMessage);
    
                setMessages(prev =>
                    prev.map(msg =>
                        msg.id === messageId ? { ...response.data } : msg
                    )
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

        // Check if it's a temporary message
        const messageToDelete = messages.find(msg => msg.id === messageId);
        if (messageToDelete?.isTemporary) {
            // Just remove from local state if it's temporary
            setMessages(prev => prev.filter(msg => msg.id !== messageId));
            return;
        }

        try {
            await API.delete(`/messages/${messageId}`);
            setMessages(prev => prev.filter(msg => msg.id !== messageId));
        } catch (err) {
            console.error('Delete message error:', err);
            toast.error('Failed to delete message');
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
        if (stompClient && selectedUser) {
            stompClient.send('/app/chat.typing', {}, JSON.stringify({
                senderId: currentUserId,
                recipientId: selectedUser.id,
                isTyping: true
            }));
        }
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
                            className={`p-4 flex items-center gap-3 cursor-pointer hover:bg-gray-100 ${selectedUser?.id === user.id ? 'bg-gray-100' : ''}`}
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
                                    <p className="text-sm text-gray-500">
                                        {typingStatus ? 'Typing...' : 'Online'}
                                    </p>
                                </div>
                            </div>

                            <div className="flex-1 p-4 overflow-y-auto">
                                {messages.map((msg) => (
                                    <div
                                        key={msg.id}
                                        className={`mb-4 flex ${msg.senderId === currentUserId ? 'justify-end' : 'justify-start'}`}
                                    >
                                        <div className={`max-w-[70%] p-3 rounded-lg ${msg.senderId === currentUserId 
                                            ? 'bg-blue-500 text-white' 
                                            : 'bg-gray-100 text-gray-800'}
                                            ${msg.isTemporary ? 'opacity-70' : ''}`}
                                        >
                                            <p>{msg.content} {msg.isEdited && <span className="text-xs opacity-75">(Edited)</span>}</p>
                                            <div className="flex justify-between items-center mt-1">
                                                <p className="text-xs opacity-75">
                                                    {new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                                </p>
                                                {msg.senderId === currentUserId &&  (
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