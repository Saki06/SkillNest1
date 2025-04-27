package com.skillnest.backend.repository;

import java.util.Date;
import java.util.List;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;

import com.skillnest.backend.model.Message;

public interface MessageRepository extends MongoRepository<Message, String> {
    List<Message> findByRecipientId(String recipientId);
    
    List<Message> findBySenderId(String senderId);
    
    long countByRecipientId(String recipientId);
    
    @Query("{$and: [{recipientId: ?0}, {timestamp: {$gt: ?1}}]}")
    long countByRecipientIdAndTimestampAfter(String recipientId, Date timestamp);
    
    @Query("{$or: [{senderId: ?0, recipientId: ?1}, {senderId: ?1, recipientId: ?0}]}")
    List<Message> findBySenderIdAndRecipientIdOrRecipientIdAndSenderId(
        String senderId, 
        String recipientId,
        String recipientId2,
        String senderId2
    );
}