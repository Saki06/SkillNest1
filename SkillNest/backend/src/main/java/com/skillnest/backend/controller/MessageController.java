package com.skillnest.backend.controller;

import java.util.Date;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.skillnest.backend.model.Message;
import com.skillnest.backend.model.TypingPayload;
import com.skillnest.backend.service.MessageService;

@RestController
@RequestMapping("/api/messages")
public class MessageController {

    @Autowired
    private SimpMessagingTemplate messagingTemplate;
    
    @Autowired
    private MessageService messageService;

    @MessageMapping("/chat.send")
    public void sendMessage(@Payload Message message) {
        message.setTimestamp(new Date());
        System.out.println("Received message from " + message.getSenderId() + " to " + message.getRecipientId() + ": " + message.getContent());
        
        Message savedMessage = messageService.saveMessage(message);
        System.out.println("Saved message with ID: " + savedMessage.getId());

        messagingTemplate.convertAndSendToUser(
            message.getRecipientId(),
            "/topic/messages",
            savedMessage
        );
        messagingTemplate.convertAndSendToUser(
            message.getSenderId(),
            "/topic/messages",
            savedMessage
        );
    }

    @GetMapping("/{userId}")
    public List<Message> getMessages(@PathVariable String userId) {
        return messageService.getMessagesForUser(userId);
    }

    @GetMapping("/conversation")
    public List<Message> getConversation(
        @RequestParam String userId,
        @RequestParam String otherUserId
    ) {
        return messageService.getConversation(userId, otherUserId);
    }

    @PutMapping("/read/{messageId}")
    public void markAsRead(@PathVariable String messageId) {
        Message message = messageService.markAsReadAndReturn(messageId);
        messagingTemplate.convertAndSendToUser(
            message.getSenderId(),
            "/topic/read-status",
            message
        );
    }

    @MessageMapping("/chat.typing")
    public void handleTyping(@Payload TypingPayload payload) {
        messagingTemplate.convertAndSendToUser(
            payload.getRecipientId(),
            "/topic/typing",
            payload
        );
    }

    @DeleteMapping("/{messageId}")
    public void deleteMessage(@PathVariable String messageId) {
        Message message = messageService.markAsReadAndReturn(messageId);
        System.out.println("Deleting message ID: " + messageId);
        
        messageService.deleteMessageById(messageId);
        
        messagingTemplate.convertAndSendToUser(
            message.getRecipientId(),
            "/topic/message-deleted",
            messageId
        );
        if (!message.getSenderId().equals(message.getRecipientId())) {
            messagingTemplate.convertAndSendToUser(
                message.getSenderId(),
                "/topic/message-deleted",
                messageId
            );
        }
    }

    @PutMapping("/{messageId}")
    public Message editMessage(@PathVariable String messageId, @RequestBody Message messageUpdate) {
        Message updatedMessage = messageService.editMessage(messageId, messageUpdate.getContent());
        
        messagingTemplate.convertAndSendToUser(
            updatedMessage.getSenderId(),
            "/topic/message-updated",
            updatedMessage
        );
        messagingTemplate.convertAndSendToUser(
            updatedMessage.getRecipientId(),
            "/topic/message-updated",
            updatedMessage
        );
        
        return updatedMessage;
    }

    @GetMapping("/new-count/{userId}")
    public long getNewMessagesCount(@PathVariable String userId) {
        return messageService.countNewMessagesSinceLastSent(userId);
    }
}