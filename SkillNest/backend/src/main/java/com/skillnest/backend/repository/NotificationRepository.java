package com.skillnest.backend.repository;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;

import com.skillnest.backend.model.Notification;

public interface NotificationRepository extends MongoRepository<Notification, String> {
    Page<Notification> findByUserId(String userId, Pageable pageable);
    Page<Notification> findByUserIdAndIsSeenFalse(String userId, Pageable pageable);
    List<Notification> findByUserIdAndIsSeenFalse(String userId);
    long countByUserIdAndIsSeenFalse(String userId);
    
    void deleteByUserId(String userId);

}