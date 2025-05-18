package com.skillnest.backend.controller;

import java.util.HashMap;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.skillnest.backend.model.Notification;
import com.skillnest.backend.repository.NotificationRepository;

@RestController
@RequestMapping("/api/auth/notifications")
@CrossOrigin(origins = "http://localhost:5173")
public class NotificationController {

    @Autowired
    private NotificationRepository notificationRepository;

    @GetMapping
    public ResponseEntity<Map<String, Object>> getNotifications(
            @RequestParam String userId,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int limit) {
        PageRequest pageRequest = PageRequest.of(page - 1, limit, Sort.by("createdAt").descending());
        Page<Notification> notificationPage = notificationRepository.findByUserId(userId, pageRequest);
        long unseenCount = notificationRepository.countByUserIdAndIsSeenFalse(userId);

        Map<String, Object> response = new HashMap<>();
        response.put("notifications", notificationPage.getContent());
        response.put("unseenCount", unseenCount);
        response.put("totalPages", notificationPage.getTotalPages());
        response.put("totalElements", notificationPage.getTotalElements());

        return ResponseEntity.ok(response);
    }

    @GetMapping("/unseen")
    public ResponseEntity<Map<String, Object>> getUnseenNotifications(
            @RequestParam String userId,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int limit) {
        PageRequest pageRequest = PageRequest.of(page - 1, limit, Sort.by("createdAt").descending());
        Page<Notification> notificationPage = notificationRepository.findByUserIdAndIsSeenFalse(userId, pageRequest);
        long unseenCount = notificationRepository.countByUserIdAndIsSeenFalse(userId);

        Map<String, Object> response = new HashMap<>();
        response.put("notifications", notificationPage.getContent());
        response.put("unseenCount", unseenCount);
        response.put("totalPages", notificationPage.getTotalPages());
        response.put("totalElements", notificationPage.getTotalElements());

        return ResponseEntity.ok(response);
    }

    @PostMapping("/{notificationId}/seen")
    public ResponseEntity<Void> markAsSeenAndDelete(@PathVariable String notificationId, @RequestBody Map<String, Boolean> body) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new RuntimeException("Notification not found"));
        notificationRepository.delete(notification);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/seen-all")
    public ResponseEntity<Void> markAllAsSeenAndDelete(@RequestParam String userId) {
        notificationRepository.deleteByUserId(userId);
        return ResponseEntity.ok().build();
    }
}