package com.skillnest.backend.model;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "posts")
public class Post {

    @Id
    private String id;
    private String title;
    private String content;
    private String visibility;
    private boolean addToPortfolio;
    private String userId;
    private List<String> mediaUrls;
    private LocalDateTime createdAt;
    private List<String> likedBy; // List of user IDs who liked the post
    private List<String> commentIds;

    public Post() {
        this.createdAt = LocalDateTime.now();
        this.likedBy = new ArrayList<>();
        this.commentIds = new ArrayList<>();
    }

    public Post(String title, String content, String visibility, boolean addToPortfolio, String userId, List<String> mediaUrls) {
        this.title = title;
        this.content = content;
        this.visibility = visibility;
        this.addToPortfolio = addToPortfolio;
        this.userId = userId;
        this.mediaUrls = mediaUrls;
        this.createdAt = LocalDateTime.now();
        this.likedBy = new ArrayList<>();
        this.commentIds = new ArrayList<>();
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }

    public String getVisibility() {
        return visibility;
    }

    public void setVisibility(String visibility) {
        this.visibility = visibility;
    }

    public boolean isAddToPortfolio() {
        return addToPortfolio;
    }

    public void setAddToPortfolio(boolean addToPortfolio) {
        this.addToPortfolio = addToPortfolio;
    }

    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }

    public List<String> getMediaUrls() {
        return mediaUrls;
    }

    public void setMediaUrls(List<String> mediaUrls) {
        this.mediaUrls = mediaUrls;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
    public List<String> getLikedBy() {
        return likedBy;
    }

    public void setLikedBy(List<String> likedBy) {
        this.likedBy = likedBy;
    }

    public List<String> getCommentIds() {
        return commentIds;
    }

    public void setCommentIds(List<String> commentIds) {
        this.commentIds = commentIds;
    }
}
