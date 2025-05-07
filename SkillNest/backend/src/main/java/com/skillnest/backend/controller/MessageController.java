package com.skillnest.backend.controller;

import java.util.Date;
import java.util.List;
import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
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

    private static final Logger logger = LoggerFactory.getLogger(MessageController.class);

    @Autowired
    private SimpMessagingTemplate messagingTemplate;
    
    @Autowired
    private MessageService messageService;
    @MessageMapping("/chat.send")
    public void sendMessage(@Payload Message message) {
        if (message.getSenderId() == null || message.getRecipientId() == null || message.getContent() == null) {
            logger.error("Invalid message received: senderId, recipientId, or content is missing");
            return;
        }
    
        message.setTimestamp(new Date());
        logger.info("Received message from {} to {}: {}", message.getSenderId(), message.getRecipientId(), message.getContent());
    
        Message savedMessage = messageService.saveMessage(message);
        logger.info("Saved message with ID: {}", savedMessage.getId());
    
        // ✅ Use /queue/messages for per-user STOMP messaging
        messagingTemplate.convertAndSendToUser(
            message.getRecipientId(),
            "/queue/messages",
            savedMessage
        );
        messagingTemplate.convertAndSendToUser(
            message.getSenderId(),
            "/queue/messages",
            savedMessage
        );
    }
    
    @GetMapping("/{userId}")
    public ResponseEntity<List<Message>> getMessages(@PathVariable String userId) {
        try {
            List<Message> messages = messageService.getMessagesForUser(userId);
            return ResponseEntity.ok(messages);
        } catch (Exception e) {
            logger.error("Error fetching messages for user {}: {}", userId, e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/conversation")
    public ResponseEntity<List<Message>> getConversation(
        @RequestParam String userId,
        @RequestParam String otherUserId
    ) {
        try {
            List<Message> conversation = messageService.getConversation(userId, otherUserId);
            return ResponseEntity.ok(conversation);
        } catch (Exception e) {
            logger.error("Error fetching conversation between {} and {}: {}", userId, otherUserId, e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @PutMapping("/read/{messageId}")
    public ResponseEntity<Void> markAsRead(@PathVariable String messageId) {
        try {
            Message message = messageService.markAsReadAndReturn(messageId);
            messagingTemplate.convertAndSendToUser(
                message.getSenderId(),
                "/topic/read-status",
                message
            );
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            logger.error("Error marking message {} as read: {}", messageId, e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
    }

    @MessageMapping("/chat.typing")
    public void handleTyping(@Payload TypingPayload payload) {
        if (payload.getSenderId() == null || payload.getRecipientId() == null) {
            logger.error("Invalid typing payload: senderId or recipientId is missing");
            return;
        }
        messagingTemplate.convertAndSendToUser(
            payload.getRecipientId(),
            "/topic/typing",
            payload
        );
    }

    @DeleteMapping("/{messageId}")
    public ResponseEntity<Void> deleteMessage(@PathVariable String messageId) {
        try {
            // Fetch the message to get sender and recipient IDs before deletion
            Message message = messageService.getMessageById(messageId);
            if (message == null) {
                logger.warn("Message with ID {} not found for deletion", messageId);
                return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
            }

            logger.info("Deleting message with ID: {}", messageId);
            messageService.deleteMessageById(messageId);

            // Notify recipient
            messagingTemplate.convertAndSendToUser(
                message.getRecipientId(),
                "/topic/message-deleted",
                messageId
            );
            // Notify sender if they are not the same as the recipient
            if (!message.getSenderId().equals(message.getRecipientId())) {
                messagingTemplate.convertAndSendToUser(
                    message.getSenderId(),
                    "/topic/message-deleted",
                    messageId
                );
            }
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            logger.error("Error deleting message {}: {}", messageId, e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @PutMapping("/{messageId}")
    public ResponseEntity<Message> editMessage(@PathVariable String messageId, @RequestBody Message messageUpdate) {
        try {
            if (messageUpdate.getContent() == null || messageUpdate.getContent().trim().isEmpty()) {
                logger.warn("Invalid message content for editing message {}", messageId);
                return ResponseEntity.badRequest().build();
            }

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
            
            return ResponseEntity.ok(updatedMessage);
        } catch (Exception e) {
            logger.error("Error editing message {}: {}", messageId, e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
    }

    @GetMapping("/new-count/{userId}")
    public ResponseEntity<Long> getNewMessagesCount(@PathVariable String userId) {
        try {
            long count = messageService.countNewMessagesSinceLastSent(userId);
            return ResponseEntity.ok(count);
        } catch (Exception e) {
            logger.error("Error counting new messages for user {}: {}", userId, e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    @MessageMapping("/chat.cancel")
    public void cancelTempMessage(@Payload Map<String, Object> payload) {
    String senderId = (String) payload.get("senderId");
    String recipientId = (String) payload.get("recipientId");
    String tempId = (String) payload.get("tempId");

    // Just notify both users to remove it from UI
    messagingTemplate.convertAndSendToUser(
        recipientId,
        "/topic/message-deleted",
        tempId
    );
    if (!senderId.equals(recipientId)) {
        messagingTemplate.convertAndSendToUser(
            senderId,
            "/topic/message-deleted",
            tempId
        );
    }
}
@MessageMapping("/chat.updateTemp")
public void updateTempMessage(@Payload Message updatedMessage) {
    String tempId = (String) updatedMessage.getId(); // passed as tempId from frontend

    // Forward the updated message content with tempId to both sender and recipient
    messagingTemplate.convertAndSendToUser(
        updatedMessage.getRecipientId(),
        "/topic/message-updated",
        updatedMessage
    );
    messagingTemplate.convertAndSendToUser(
        updatedMessage.getSenderId(),
        "/topic/message-updated",
        updatedMessage
    );
}
@PostMapping("/save")
public ResponseEntity<Message> saveTempMessage(@RequestBody Message message) {
    try {
        message.setTimestamp(new Date());
        Message savedMessage = messageService.saveMessage(message);
        return ResponseEntity.ok(savedMessage);
    } catch (Exception e) {
        logger.error("Failed to save temp message: {}", e.getMessage());
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
    }
}


}