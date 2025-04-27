package com.skillnest.backend.repository;

import java.util.List;

import org.springframework.data.mongodb.repository.MongoRepository;

import com.skillnest.backend.model.Comment;

public interface CommentRepository extends MongoRepository<Comment, String> {
    List<Comment> findByPostIdOrderByCreatedAtDesc(String postId);
}