package com.skillnest.backend.service;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import com.skillnest.backend.model.Comment;
import com.skillnest.backend.model.Notification;
import com.skillnest.backend.model.Post;
import com.skillnest.backend.model.User;
import com.skillnest.backend.repository.CommentRepository;
import com.skillnest.backend.repository.NotificationRepository;
import com.skillnest.backend.repository.PostRepository;
import com.skillnest.backend.repository.UserRepository;

@Service
public class LikeCommentService {

    private final PostRepository postRepository;
    private final CommentRepository commentRepository;
    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;
    private final SimpMessagingTemplate messagingTemplate;

    public LikeCommentService(
            PostRepository postRepository,
            CommentRepository commentRepository,
            NotificationRepository notificationRepository,
            UserRepository userRepository,
            SimpMessagingTemplate messagingTemplate) {
        this.postRepository = postRepository;
        this.commentRepository = commentRepository;
        this.notificationRepository = notificationRepository;
        this.userRepository = userRepository;
        this.messagingTemplate = messagingTemplate;
    }

    public Post likePost(String postId, String userId) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new RuntimeException("Post not found"));
        List<String> likedBy = post.getLikedBy();
        if (!likedBy.contains(userId)) {
            likedBy.add(userId);
            post.setLikedBy(likedBy);
            post = postRepository.save(post);

            if (!userId.equals(post.getUserId())) {
                User liker = userRepository.findById(userId)
                        .orElseThrow(() -> new RuntimeException("User not found"));
                Notification notification = new Notification(
                        post.getUserId(), userId, "LIKE",
                        liker.getName() + " liked your post",
                        postId
                );
                notificationRepository.save(notification);
                messagingTemplate.convertAndSendToUser(
                        post.getUserId(), "/queue/notifications", notification);
            }
        }
        return post;
    }

    public Post unlikePost(String postId, String userId) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new RuntimeException("Post not found"));
        List<String> likedBy = post.getLikedBy();
        if (likedBy.contains(userId)) {
            likedBy.remove(userId);
            post.setLikedBy(likedBy);
            return postRepository.save(post);
        }
        return post;
    }

    public Comment addComment(String postId, String userId, String content) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new RuntimeException("Post not found"));
        Comment comment = new Comment(postId, userId, content);
        Comment savedComment = commentRepository.save(comment);
        post.getCommentIds().add(savedComment.getId());
        postRepository.save(post);

        if (!userId.equals(post.getUserId())) {
            User commenter = userRepository.findById(userId)
                    .orElseThrow(() -> new RuntimeException("Commenter not found"));
            Notification notification = new Notification(
                    post.getUserId(), userId, "COMMENT",
                    commenter.getName() + " commented on your post",
                    postId
            );
            notificationRepository.save(notification);
            messagingTemplate.convertAndSendToUser(
                    post.getUserId(), "/queue/notifications", notification);
        }
        return savedComment;
    }

    public Comment editComment(String commentId, String userId, String content) {
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new RuntimeException("Comment not found"));
        if (!comment.getUserId().equals(userId)) {
            throw new RuntimeException("You can only edit your own comments");
        }
        comment.setContent(content);
        comment.setUpdatedAt(LocalDateTime.now());
        return commentRepository.save(comment);
    }

    public void deleteComment(String commentId, String userId) {
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new RuntimeException("Comment not found"));
        if (!comment.getUserId().equals(userId)) {
            throw new RuntimeException("You can only delete your own comments");
        }
        commentRepository.deleteById(commentId);
        Post post = postRepository.findById(comment.getPostId())
                .orElseThrow(() -> new RuntimeException("Post not found"));
        post.getCommentIds().remove(commentId);
        postRepository.save(post);
    }

    public List<Comment> getCommentsByPostId(String postId) {
        return commentRepository.findByPostIdOrderByCreatedAtDesc(postId);
    }
}
