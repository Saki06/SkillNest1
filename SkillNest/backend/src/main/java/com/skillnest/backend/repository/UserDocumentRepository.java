package com.skillnest.backend.repository;

import java.util.List;

import org.springframework.data.mongodb.repository.MongoRepository;

import com.skillnest.backend.model.UserDocument;

public interface UserDocumentRepository extends MongoRepository<UserDocument, String> {
    List<UserDocument> findByUserId(String userId);
}
