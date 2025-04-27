// src/main/java/com/skillnest/backend/repository/NotificationRepository.java
package com.skillnest.backend.repository;

import java.util.List;

import org.springframework.data.mongodb.repository.MongoRepository;

import com.skillnest.backend.model.Notification;

public interface NotificationRepository extends MongoRepository<Notification, String> {
    List<Notification> findByUserIdOrderByCreatedAtDesc(String userId);
    List<Notification> findByUserIdAndIsReadFalse(String userId);
}