package com.skillnest.backend.model;

import java.util.Date;

public class Message {
    private String id;
    private String senderId;
    private String recipientId;
    private String content;
    private Date timestamp;
    private boolean isRead;
    private boolean isEdited;

    // Constructors
    public Message() {}
    
    public Message(String senderId, String recipientId, String content) {
        this.senderId = senderId;
        this.recipientId = recipientId;
        this.content = content;
        this.timestamp = new Date();
        this.isRead = false;
        this.isEdited = false;
    }

    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    
    public String getSenderId() { return senderId; }
    public void setSenderId(String senderId) { this.senderId = senderId; }
    
    public String getRecipientId() { return recipientId; }
    public void setRecipientId(String recipientId) { this.recipientId = recipientId; }
    
    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }
    
    public Date getTimestamp() { return timestamp; }
    public void setTimestamp(Date timestamp) { this.timestamp = timestamp; }
    
    public boolean isRead() { return isRead; }
    public void setRead(boolean read) { isRead = read; }
    public boolean isEdited() {return isEdited;}

    public void setEdited(boolean edited) {isEdited = edited;}
}
