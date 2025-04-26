package com.skillnest.backend.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.skillnest.backend.model.Message;
import com.skillnest.backend.repository.MessageRepository;

@Service
public class MessageService {

    @Autowired
    private MessageRepository messageRepository;

    public Message saveMessage(Message message) {
        return messageRepository.save(message);
    }

    public List<Message> getMessagesForUser(String userId) {
        return messageRepository.findByRecipientId(userId);
    }

    public List<Message> getConversation(String userId, String otherUserId) {
        return messageRepository.findBySenderIdAndRecipientIdOrRecipientIdAndSenderId(
            userId, otherUserId, userId, otherUserId
        );
    }

    public Message markAsReadAndReturn(String messageId) {
        Message message = messageRepository.findById(messageId).orElseThrow();
        message.setRead(true);
        return messageRepository.save(message);
    }

    public void deleteMessageById(String messageId) {
        messageRepository.deleteById(messageId);
    }

    public Message editMessage(String messageId, String newContent) {
        Message message = messageRepository.findById(messageId).orElseThrow();
        message.setContent(newContent);
        message.setEdited(true);
        return messageRepository.save(message);
    }

    public long countNewMessagesSinceLastSent(String userId) {
        // Find the timestamp of the last message sent by the user
        List<Message> sentMessages = messageRepository.findBySenderId(userId);
        if (sentMessages.isEmpty()) {
            // If no messages sent, count all received messages
            return messageRepository.countByRecipientId(userId);
        }

        // Get the timestamp of the most recent sent message
        Message lastSentMessage = sentMessages.stream()
            .max((m1, m2) -> m1.getTimestamp().compareTo(m2.getTimestamp()))
            .orElse(null);

        if (lastSentMessage == null) {
            return messageRepository.countByRecipientId(userId);
        }

        // Count messages received after the last sent message
        return messageRepository.countByRecipientIdAndTimestampAfter(
            userId, 
            lastSentMessage.getTimestamp()
        );
    }
}