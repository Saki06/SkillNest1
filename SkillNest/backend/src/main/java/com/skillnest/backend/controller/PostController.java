// ✅ PostController.java — updated to fix Post constructor error using setters
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
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.http.HttpStatus;
import com.skillnest.backend.model.Post;
import com.skillnest.backend.repository.PostRepository;
import com.skillnest.backend.repository.UserRepository;
import com.skillnest.backend.service.PostService;

@RestController
@RequestMapping("/api/auth/posts")
@CrossOrigin(origins = "http://localhost:5173")
public class PostController {

    @Autowired private PostService postService;
    @Autowired private PostRepository postRepository;
    @Autowired private UserRepository userRepository;

    @PostMapping(consumes = {"multipart/form-data"})
    public ResponseEntity<?> createPostWithMedia(
        @RequestParam("title") String title,
        @RequestParam("content") String content,
        @RequestParam("visibility") String visibility,
        @RequestParam("addToPortfolio") boolean addToPortfolio,
        @RequestParam("userId") String userId,
        @RequestParam(value = "files", required = false) List<MultipartFile> files
    ) {
        try {
            Post post = new Post();
            post.setUserId(userId);
            post.setTitle(title);
            post.setContent(content);
            post.setVisibility(visibility);
            post.setAddToPortfolio(addToPortfolio);

            Post savedPost = postService.createPost(post, files);
            return ResponseEntity.status(201).body(savedPost);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Error creating post: " + e.getMessage());
        }
    }

    @GetMapping
    public ResponseEntity<List<Map<String, Object>>> getAllPosts() {
        List<Post> posts = postRepository.findAll();
        List<Map<String, Object>> enrichedPosts = posts.stream().map(post -> {
            Map<String, Object> map = new HashMap<>();
            map.put("id", post.getId());
            map.put("title", post.getTitle());
            map.put("content", post.getContent());
            map.put("mediaUrls", post.getMediaUrls());
            map.put("createdAt", post.getCreatedAt());
            map.put("userId", post.getUserId());
            map.put("likeCount", post.getLikedBy().size());
            map.put("commentCount", post.getCommentIds().size());
            map.put("likedBy", post.getLikedBy());
            userRepository.findById(post.getUserId()).ifPresent(user -> {
                Map<String, Object> userMap = new HashMap<>();
                userMap.put("id", user.getId());
                userMap.put("name", user.getName());
                userMap.put("profileImage", user.getProfileImage());
                userMap.put("country", user.getCountry());
                userMap.put("username", user.getEmail().split("@")[0]);
                userMap.put("isMember", true);
                map.put("user", userMap);
            });
            return map;
        }).collect(Collectors.toList());
        return ResponseEntity.ok(enrichedPosts);
    }

    @PostMapping("/text")
    public ResponseEntity<Post> createPostTextOnly(@RequestBody Post post) {
        return ResponseEntity.ok(postService.savePost(post));
    }

    @GetMapping("/user")
    public ResponseEntity<List<Post>> getUserPosts(@RequestParam String userId) {
        return ResponseEntity.ok(postService.getUserPosts(userId));
    }

    @GetMapping("/visible")
    public ResponseEntity<List<Post>> getVisiblePosts(@RequestParam String visibility, @RequestParam String userId) {
        return ResponseEntity.ok(postService.getVisiblePosts(visibility, userId));
    }

    @DeleteMapping("/{postId}")
    public ResponseEntity<?> deletePost(@PathVariable String postId) {
        try {
            postService.deletePost(postId);
            return ResponseEntity.ok("Post deleted successfully");
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Error deleting post");
        }
    }
    @PutMapping("/{postId}")
    public ResponseEntity<?> updatePost(
        @PathVariable String postId,
        @RequestParam("title") String title,
        @RequestParam("content") String content,
        @RequestParam("visibility") String visibility,
        @RequestParam("addToPortfolio") boolean addToPortfolio,
        @RequestParam("userId") String userId,
        @RequestParam(value = "files", required = false) List<MultipartFile> files
    ) {
        try {
            Post updatedPost = new Post();
            updatedPost.setId(postId);
            updatedPost.setUserId(userId);
            updatedPost.setTitle(title);
            updatedPost.setContent(content);
            updatedPost.setVisibility(visibility);
            updatedPost.setAddToPortfolio(addToPortfolio);

            Post savedPost = postService.updatePost(postId, updatedPost, files);
            return ResponseEntity.ok(savedPost);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("Error updating post: " + e.getMessage());
        }
    }
}