package com.skillnest.backend.model;

public class TypingPayload {
    private String senderId;
    private String recipientId;
    private boolean isTyping;

    // Constructors
    public TypingPayload() {}

    public TypingPayload(String senderId, String recipientId, boolean isTyping) {
        this.senderId = senderId;
        this.recipientId = recipientId;
        this.isTyping = isTyping;
    }

    // Getters and Setters
    public String getSenderId() {
        return senderId;
    }

    public void setSenderId(String senderId) {
        this.senderId = senderId;
    }

    public String getRecipientId() {
        return recipientId;
    }

    public void setRecipientId(String recipientId) {
        this.recipientId = recipientId;
    }

    public boolean isTyping() {
        return isTyping;
    }

    public void setTyping(boolean typing) {
        isTyping = typing;
    }
}
