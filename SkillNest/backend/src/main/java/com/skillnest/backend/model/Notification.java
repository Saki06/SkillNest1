// src/main/java/com/skillnest/backend/model/Notification.java
package com.skillnest.backend.model;

import java.time.LocalDateTime;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "notifications")
public class Notification {

    @Id
    private String id;
    private String userId; // Recipient (post owner)
    private String senderId; // User who liked or commented
    private String type; // e.g., "LIKE", "COMMENT"
    private String message; // e.g., "John liked your post"
    private String postId; // Reference to the post
    private boolean isRead;
    private LocalDateTime createdAt;

    public Notification() {
        this.createdAt = LocalDateTime.now();
        this.isRead = false;
    }

    public Notification(String userId, String senderId, String type, String message, String postId) {
        this.userId = userId;
        this.senderId = senderId;
        this.type = type;
        this.message = message;
        this.postId = postId;
        this.createdAt = LocalDateTime.now();
        this.isRead = false;
    }

    // Getters and setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }
    public String getSenderId() { return senderId; }
    public void setSenderId(String senderId) { this.senderId = senderId; }
    public String getType() { return type; }
    public void setType(String type) { this.type = type; }
    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }
    public String getPostId() { return postId; }
    public void setPostId(String postId) { this.postId = postId; }
    public boolean isRead() { return isRead; }
    public void setRead(boolean read) { isRead = read; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}