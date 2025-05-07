package com.skillnest.backend.service;

import java.io.File;
import java.io.IOException;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import com.skillnest.backend.model.Post;
import com.skillnest.backend.repository.PostRepository;

@Service
public class PostService {

    private final PostRepository postRepository;

    @Value("${file.upload-dir}")
    private String uploadDir;

    public PostService(PostRepository postRepository) {
        this.postRepository = postRepository;
    }

    public Post createPost(Post post, List<MultipartFile> files) {
        List<String> mediaUrls = new ArrayList<>();
        if (files != null && !files.isEmpty()) {
            for (MultipartFile file : files) {
                String contentType = file.getContentType();
                if (contentType != null && (
                        contentType.startsWith("image/") ||
                        contentType.startsWith("video/") ||
                        contentType.equals("application/pdf"))) {
                    try {
                        File uploadPath = new File(uploadDir);
                        if (!uploadPath.exists()) {
                            uploadPath.mkdirs();
                        }
                        String filename = UUID.randomUUID() + "_" + file.getOriginalFilename();
                        File destination = new File(uploadPath, filename);
                        file.transferTo(destination);
                        String fileUrl = "/uploads/" + filename;
                        mediaUrls.add(fileUrl);
                    } catch (IOException e) {
                        throw new RuntimeException("Failed to upload file: " + file.getOriginalFilename(), e);
                    }
                }
            }
        }
        post.setMediaUrls(mediaUrls);
        post.setCreatedAt(LocalDateTime.now());
        return postRepository.save(post);
    }

    public List<Post> getAllPosts() {
        return postRepository.findAll();
    }

    public List<Post> getUserPosts(String userId) {
        return postRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    public List<Post> getVisiblePosts(String visibility, String userId) {
        return postRepository.findByVisibilityAndUserId(visibility, userId);
    }

    public void deletePost(String postId) {
        postRepository.deleteById(postId);
    }

    public Post savePost(Post post) {
        return postRepository.save(post);
    }

    public Post updatePost(String postId, Post updatedPost, List<MultipartFile> files, List<String> removedMedia) {
        // Find existing post
        Optional<Post> existingPostOpt = postRepository.findById(postId);
        if (!existingPostOpt.isPresent()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Post not found");
        }

        Post existingPost = existingPostOpt.get();

        // Update fields
        existingPost.setTitle(updatedPost.getTitle());
        existingPost.setContent(updatedPost.getContent());
        existingPost.setVisibility(updatedPost.getVisibility());
        existingPost.setAddToPortfolio(updatedPost.isAddToPortfolio());

        // Handle media URLs
        List<String> mediaUrls = existingPost.getMediaUrls() != null ? new ArrayList<>(existingPost.getMediaUrls()) : new ArrayList<>();

        // Remove specified media URLs and delete files
        if (removedMedia != null && !removedMedia.isEmpty()) {
            for (String mediaUrl : removedMedia) {
                mediaUrls.remove(mediaUrl);
                // Delete the file from the server
                String filename = mediaUrl.substring(mediaUrl.lastIndexOf('/') + 1);
                File fileToDelete = new File(uploadDir, filename);
                if (fileToDelete.exists()) {
                    if (!fileToDelete.delete()) {
                        throw new RuntimeException("Failed to delete file: " + filename);
                    }
                }
            }
        }

        // Add new files
        if (files != null && !files.isEmpty()) {
            for (MultipartFile file : files) {
                String contentType = file.getContentType();
                if (contentType != null && (
                        contentType.startsWith("image/") ||
                        contentType.startsWith("video/") ||
                        contentType.equals("application/pdf"))) {
                    try {
                        File uploadPath = new File(uploadDir);
                        if (!uploadPath.exists()) {
                            uploadPath.mkdirs();
                        }
                        String filename = UUID.randomUUID() + "_" + file.getOriginalFilename();
                        File destination = new File(uploadPath, filename);
                        file.transferTo(destination);
                        String fileUrl = "/uploads/" + filename;
                        mediaUrls.add(fileUrl);
                    } catch (IOException e) {
                        throw new RuntimeException("Failed to upload file: " + file.getOriginalFilename(), e);
                    }
                }
            }
        }

        existingPost.setMediaUrls(mediaUrls);

        // Save updated post
        return postRepository.save(existingPost);
    }
}