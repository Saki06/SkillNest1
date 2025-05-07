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

    public Message getMessageById(String messageId) {
        return messageRepository.findById(messageId).orElse(null);
    }

    public Message markAsReadAndReturn(String messageId) {
        Message message = messageRepository.findById(messageId)
                .orElseThrow(() -> new RuntimeException("Message not found with ID: " + messageId));
        message.setRead(true);
        return messageRepository.save(message);
    }

    public void deleteMessageById(String messageId) {
        if (!messageRepository.existsById(messageId)) {
            throw new RuntimeException("Message not found with ID: " + messageId);
        }
        messageRepository.deleteById(messageId);
    }

    public Message editMessage(String messageId, String newContent) {
        Message message = messageRepository.findById(messageId)
                .orElseThrow(() -> new RuntimeException("Message not found with ID: " + messageId));
        message.setContent(newContent);
        message.setEdited(true);
        return messageRepository.save(message);
    }

    public long countNewMessagesSinceLastSent(String userId) {
        List<Message> sentMessages = messageRepository.findBySenderId(userId);
        if (sentMessages.isEmpty()) {
            return messageRepository.countByRecipientId(userId);
        }

        Message lastSentMessage = sentMessages.stream()
            .max((m1, m2) -> m1.getTimestamp().compareTo(m2.getTimestamp()))
            .orElse(null);

        if (lastSentMessage == null) {
            return messageRepository.countByRecipientId(userId);
        }

        return messageRepository.countByRecipientIdAndTimestampAfter(
            userId, 
            lastSentMessage.getTimestamp()
        );
    }
}