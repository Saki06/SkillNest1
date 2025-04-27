package com.skillnest.backend.controller;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.skillnest.backend.model.Comment;
import com.skillnest.backend.model.Post;
import com.skillnest.backend.repository.UserRepository;
import com.skillnest.backend.service.LikeCommentService;

@RestController
@RequestMapping("/api/auth/posts")
@CrossOrigin(origins = "http://localhost:5173")
public class LikeCommentController {

    @Autowired
    private LikeCommentService likeCommentService;

    @Autowired
    private UserRepository userRepository;

    @PostMapping("/{postId}/like")
    public ResponseEntity<?> likePost(@PathVariable String postId, @RequestParam String userId) {
        try {
            Post updatedPost = likeCommentService.likePost(postId, userId);
            return ResponseEntity.ok(updatedPost);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Error liking post: " + e.getMessage());
        }
    }

    @PostMapping("/{postId}/unlike")
    public ResponseEntity<?> unlikePost(@PathVariable String postId, @RequestParam String userId) {
        try {
            Post updatedPost = likeCommentService.unlikePost(postId, userId);
            return ResponseEntity.ok(updatedPost);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Error unliking post: " + e.getMessage());
        }
    }

    @PostMapping("/{postId}/comment")
    public ResponseEntity<?> addComment(@PathVariable String postId, @RequestParam String userId, @RequestParam String content) {
        try {
            Comment comment = likeCommentService.addComment(postId, userId, content);
            return ResponseEntity.status(201).body(comment);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Error adding comment: " + e.getMessage());
        }
    }

    @PostMapping("/comment/{commentId}/edit")
    public ResponseEntity<?> editComment(@PathVariable String commentId, @RequestParam String userId, @RequestParam String content) {
        try {
            Comment updatedComment = likeCommentService.editComment(commentId, userId, content);
            return ResponseEntity.ok(updatedComment);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Error editing comment: " + e.getMessage());
        }
    }

    @DeleteMapping("/comment/{commentId}")
    public ResponseEntity<?> deleteComment(@PathVariable String commentId, @RequestParam String userId) {
        try {
            likeCommentService.deleteComment(commentId, userId);
            return ResponseEntity.ok("Comment deleted successfully");
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Error deleting comment: " + e.getMessage());
        }
    }

    @GetMapping("/{postId}/comments")
    public ResponseEntity<List<Map<String, Object>>> getComments(@PathVariable String postId) {
        List<Comment> comments = likeCommentService.getCommentsByPostId(postId);
        List<Map<String, Object>> enrichedComments = comments.stream().map(comment -> {
            Map<String, Object> map = new HashMap<>();
            map.put("id", comment.getId());
            map.put("postId", comment.getPostId());
            map.put("userId", comment.getUserId());
            map.put("content", comment.getContent());
            map.put("createdAt", comment.getCreatedAt());
            map.put("updatedAt", comment.getUpdatedAt());

            userRepository.findById(comment.getUserId()).ifPresent(user -> {
                Map<String, Object> userMap = new HashMap<>();
                userMap.put("id", user.getId());
                userMap.put("name", user.getName());
                userMap.put("profileImage", user.getProfileImage());
                userMap.put("username", user.getEmail().split("@")[0]);
                map.put("user", userMap);
            });

            return map;
        }).collect(Collectors.toList());

        return ResponseEntity.ok(enrichedComments);
    }
}