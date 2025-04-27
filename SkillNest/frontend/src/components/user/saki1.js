import { Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import RegisterPage from './components/RegisterPage';
import LoginPage from './components/LoginPage';
import GoogleCallback from './components/GoogleCallback';
import ProfileLayout from './components/profile/ProfileLayout';
import AboutSection from './components/profile/AboutSection';
import SkillsSection from './components/profile/SkillsSection';
import DocumentsSection from './components/profile/DocumentsSection';
import ShowcasesSection from './components/profile/ShowcasesSection';
import RecommendationsSection from './components/profile/RecommendationsSection';
import PostsSection from './components/profile/PostsSection';
import SearchPage from './pages/SearchPage';
import Index from './pages/Index';
import ChatPage from './pages/ChatPage';
import ChatInterface from './components/ChatInterface';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/auth/google/callback" element={<GoogleCallback />} />
        
        <Route path="/profile" element={<ProfileLayout />}>
          <Route path="about" element={<AboutSection />} />
          <Route path="skills" element={<SkillsSection />} />
          <Route path="documents" element={<DocumentsSection />} />
          <Route path="showcases" element={<ShowcasesSection />} />
          <Route path="recommendations" element={<RecommendationsSection />} />
          <Route path="posts" element={<PostsSection />} />
        </Route>
        <Route path="/user" element={<Index />} />
        <Route path="/search" element={<SearchPage />} />
        <Route path="/chat" element={<ChatPage />} />
        <Route path="/chat/:senderId/:receiverId" element={<ChatInterface />} />
      </Routes>
      <ToastContainer />
    </>
  );
}

export default App;

// package com.skillnest.backend.security;
// import java.security.Key;
// import java.util.Date;

// import org.springframework.stereotype.Component;

// import io.jsonwebtoken.JwtException;
// import io.jsonwebtoken.Jwts;
// import io.jsonwebtoken.SignatureAlgorithm;
// import io.jsonwebtoken.security.Keys;

// @Component
// public class JwtUtil {
//     private final Key key = Keys.secretKeyFor(SignatureAlgorithm.HS256);
//     private final long EXPIRATION = 1000 * 60 * 60 * 24; // 24h

//     public String generateToken(String userId) {
//         return Jwts.builder()
//                 .setSubject(userId)
//                 .setIssuedAt(new Date())
//                 .setExpiration(new Date(System.currentTimeMillis() + EXPIRATION))
//                 .signWith(key)
//                 .compact();
//     }

//     public String validateToken(String token) {
//         try {
//             return Jwts.parserBuilder()
//                     .setSigningKey(key)
//                     .build()
//                     .parseClaimsJws(token)
//                     .getBody()
//                     .getSubject();
//         } catch (JwtException e) {
//             return null;
//         }
//     }
    
// }
// src/main/java/com/skillnest/backend/controller/PostController.java
// package com.skillnest.backend.controller;

// import java.util.HashMap;
// import java.util.List;
// import java.util.Map;
// import java.util.Optional;
// import java.util.stream.Collectors;

// import org.springframework.beans.factory.annotation.Autowired;
// import org.springframework.http.HttpStatus;
// import org.springframework.http.ResponseEntity;
// import org.springframework.web.bind.annotation.CrossOrigin;
// import org.springframework.web.bind.annotation.DeleteMapping;
// import org.springframework.web.bind.annotation.GetMapping;
// import org.springframework.web.bind.annotation.PathVariable;
// import org.springframework.web.bind.annotation.PostMapping;
// import org.springframework.web.bind.annotation.RequestBody;
// import org.springframework.web.bind.annotation.RequestMapping;
// import org.springframework.web.bind.annotation.RequestParam;
// import org.springframework.web.bind.annotation.RestController;
// import org.springframework.web.multipart.MultipartFile;

// import com.skillnest.backend.model.Comment;
// import com.skillnest.backend.model.Post;
// import com.skillnest.backend.model.User;
// import com.skillnest.backend.repository.PostRepository;
// import com.skillnest.backend.repository.UserRepository;
// import com.skillnest.backend.service.PostService;

// @RestController
// @RequestMapping("/api/auth/posts")
// @CrossOrigin(origins = "http://localhost:5173")
// public class PostController {

//     @Autowired
//     private PostService postService;

//     @Autowired
//     private PostRepository postRepository;

//     @Autowired
//     private UserRepository userRepository;

//     @PostMapping(consumes = {"multipart/form-data"})
//     public ResponseEntity<?> createPostWithMedia(
//             @RequestParam("title") String title,
//             @RequestParam("content") String content,
//             @RequestParam("visibility") String visibility,
//             @RequestParam("addToPortfolio") boolean addToPortfolio,
//             @RequestParam("userId") String userId,
//             @RequestParam(value = "files", required = false) List<MultipartFile> files
//     ) {
//         try {
//             Post post = new Post();
//             post.setUserId(userId);
//             post.setTitle(title);
//             post.setContent(content);
//             post.setVisibility(visibility);
//             post.setAddToPortfolio(addToPortfolio);

//             Post savedPost = postService.createPost(post, files);
//             return ResponseEntity.status(HttpStatus.CREATED).body(savedPost);
//         } catch (Exception e) {
//             return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
//                     .body("Error creating post: " + e.getMessage());
//         }
//     }

//     @PostMapping("/{postId}/like")
//     public ResponseEntity<?> likePost(@PathVariable String postId, @RequestParam String userId) {
//         try {
//             Post updatedPost = postService.likePost(postId, userId);
//             return ResponseEntity.ok(updatedPost);
//         } catch (Exception e) {
//             return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
//                     .body("Error liking post: " + e.getMessage());
//         }
//     }

//     @PostMapping("/{postId}/unlike")
//     public ResponseEntity<?> unlikePost(@PathVariable String postId, @RequestParam String userId) {
//         try {
//             Post updatedPost = postService.unlikePost(postId, userId);
//             return ResponseEntity.ok(updatedPost);
//         } catch (Exception e) {
//             return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
//                     .body("Error unliking post: " + e.getMessage());
//         }
//     }

//     @PostMapping("/{postId}/comment")
//     public ResponseEntity<?> addComment(
//             @PathVariable String postId,
//             @RequestParam String userId,
//             @RequestParam String content
//     ) {
//         try {
//             Comment comment = postService.addComment(postId, userId, content);
//             return ResponseEntity.status(HttpStatus.CREATED).body(comment);
//         } catch (Exception e) {
//             return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
//                     .body("Error adding comment: " + e.getMessage());
//         }
//     }

//     @PostMapping("/comment/{commentId}/edit")
//     public ResponseEntity<?> editComment(
//             @PathVariable String commentId,
//             @RequestParam String userId,
//             @RequestParam String content
//     ) {
//         try {
//             Comment updatedComment = postService.editComment(commentId, userId, content);
//             return ResponseEntity.ok(updatedComment);
//         } catch (Exception e) {
//             return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
//                     .body("Error editing comment: " + e.getMessage());
//         }
//     }

//     @DeleteMapping("/comment/{commentId}")
//     public ResponseEntity<?> deleteComment(
//             @PathVariable String commentId,
//             @RequestParam String userId
//     ) {
//         try {
//             postService.deleteComment(commentId, userId);
//             return ResponseEntity.ok().body("Comment deleted successfully");
//         } catch (Exception e) {
//             return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
//                     .body("Error deleting comment: " + e.getMessage());
//         }
//     }

//     @GetMapping("/{postId}/comments")
//     public ResponseEntity<List<Map<String, Object>>> getComments(@PathVariable String postId) {
//         List<Comment> comments = postService.getCommentsByPostId(postId);
//         List<Map<String, Object>> enrichedComments = comments.stream().map(comment -> {
//             Map<String, Object> map = new HashMap<>();
//             map.put("id", comment.getId());
//             map.put("postId", comment.getPostId());
//             map.put("userId", comment.getUserId());
//             map.put("content", comment.getContent());
//             map.put("createdAt", comment.getCreatedAt());
//             map.put("updatedAt", comment.getUpdatedAt());

//             Optional<User> userOpt = userRepository.findById(comment.getUserId());
//             userOpt.ifPresent(user -> {
//                 Map<String, Object> userMap = new HashMap<>();
//                 userMap.put("id", user.getId());
//                 userMap.put("name", user.getName());
//                 userMap.put("profileImage", user.getProfileImage());
//                 userMap.put("username", user.getEmail().split("@")[0]);
//                 map.put("user", userMap);
//             });

//             return map;
//         }).collect(Collectors.toList());
//         return ResponseEntity.ok(enrichedComments);
//     }

//     @GetMapping
//     public ResponseEntity<List<Map<String, Object>>> getAllPosts() {
//         List<Post> posts = postRepository.findAll();
//         List<Map<String, Object>> enrichedPosts = posts.stream().map(post -> {
//             Map<String, Object> map = new HashMap<>();
//             map.put("id", post.getId());
//             map.put("title", post.getTitle());
//             map.put("content", post.getContent());
//             map.put("mediaUrls", post.getMediaUrls());
//             map.put("createdAt", post.getCreatedAt());
//             map.put("userId", post.getUserId());
//             map.put("likeCount", post.getLikedBy().size());
//             map.put("commentCount", post.getCommentIds().size());
//             map.put("likedBy", post.getLikedBy());

//             Optional<User> userOpt = userRepository.findById(post.getUserId());
//             userOpt.ifPresent(user -> {
//                 Map<String, Object> userMap = new HashMap<>();
//                 userMap.put("id", user.getId());
//                 userMap.put("name", user.getName());
//                 userMap.put("profileImage", user.getProfileImage());
//                 userMap.put("country", user.getCountry());
//                 userMap.put("username", user.getEmail().split("@")[0]);
//                 userMap.put("isMember", true);
//                 map.put("user", userMap);
//             });

//             return map;
//         }).collect(Collectors.toList());
//         return ResponseEntity.ok(enrichedPosts);
//     }

//     // ✅ Create a post without files
//     @PostMapping("/text")
//     public ResponseEntity<Post> createPostTextOnly(@RequestBody Post post) {
//         return ResponseEntity.ok(postService.savePost(post));
//     }
//     // ✅ Get posts for a specific user
//     @GetMapping("/user")
//     public ResponseEntity<List<Post>> getUserPosts(@RequestParam String userId) {
//         return ResponseEntity.ok(postService.getUserPosts(userId));
//     }
//     // ✅ Get posts by visibility
//     @GetMapping("/visible")
//     public ResponseEntity<List<Post>> getVisiblePosts(@RequestParam String visibility, @RequestParam String userId) {
//         return ResponseEntity.ok(postService.getVisiblePosts(visibility, userId));
//     }
//     // ✅ Delete a post
//     @DeleteMapping("/{postId}")
//     public ResponseEntity<?> deletePost(@PathVariable String postId) {
//         try {
//             postService.deletePost(postId);
//             return ResponseEntity.ok("Post deleted successfully");
//         } catch (Exception e) {
//             return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error deleting post");
//         }
//     }
// }
// src/main/java/com/skillnest/backend/service/PostService.java
// package com.skillnest.backend.service;

// import java.io.File;
// import java.io.IOException;
// import java.time.LocalDateTime;
// import java.util.ArrayList;
// import java.util.List;
// import java.util.UUID;

// import org.springframework.beans.factory.annotation.Value;
// import org.springframework.messaging.simp.SimpMessagingTemplate;
// import org.springframework.stereotype.Service;
// import org.springframework.web.multipart.MultipartFile;

// import com.skillnest.backend.model.Comment;
// import com.skillnest.backend.model.Notification;
// import com.skillnest.backend.model.Post;
// import com.skillnest.backend.model.User;
// import com.skillnest.backend.repository.CommentRepository;
// import com.skillnest.backend.repository.NotificationRepository;
// import com.skillnest.backend.repository.PostRepository;
// import com.skillnest.backend.repository.UserRepository;

// @Service
// public class PostService {

//     private final PostRepository postRepository;
//     private final CommentRepository commentRepository;
//     private final NotificationRepository notificationRepository;
//     private final UserRepository userRepository;
//     private final SimpMessagingTemplate messagingTemplate;

//     @Value("${file.upload-dir}")
//     private String uploadDir;

//     public PostService(
//             PostRepository postRepository,
//             CommentRepository commentRepository,
//             NotificationRepository notificationRepository,
//             UserRepository userRepository,
//             SimpMessagingTemplate messagingTemplate) {
//         this.postRepository = postRepository;
//         this.commentRepository = commentRepository;
//         this.notificationRepository = notificationRepository;
//         this.userRepository = userRepository;
//         this.messagingTemplate = messagingTemplate;
//     }

//     public Post createPost(Post post, List<MultipartFile> files) {
//         List<String> mediaUrls = new ArrayList<>();
//         if (files != null && !files.isEmpty()) {
//             for (MultipartFile file : files) {
//                 String contentType = file.getContentType();
//                 if (contentType != null && (
//                         contentType.startsWith("image/") ||
//                         contentType.startsWith("video/") ||
//                         contentType.equals("application/pdf"))) {
//                     try {
//                         File uploadPath = new File(uploadDir);
//                         if (!uploadPath.exists()) {
//                             uploadPath.mkdirs();
//                         }
//                         String filename = UUID.randomUUID() + "_" + file.getOriginalFilename();
//                         File destination = new File(uploadPath, filename);
//                         file.transferTo(destination);
//                         String fileUrl = "/uploads/" + filename;
//                         mediaUrls.add(fileUrl);
//                     } catch (IOException e) {
//                         throw new RuntimeException("Failed to upload file: " + file.getOriginalFilename(), e);
//                     }
//                 }
//             }
//         }
//         post.setMediaUrls(mediaUrls);
//         post.setCreatedAt(LocalDateTime.now());
//         return postRepository.save(post);
//     }

//     public Post likePost(String postId, String userId) {
//         Post post = postRepository.findById(postId)
//                 .orElseThrow(() -> new RuntimeException("Post not found"));
//         List<String> likedBy = post.getLikedBy();
//         if (!likedBy.contains(userId)) {
//             likedBy.add(userId);
//             post.setLikedBy(likedBy);
//             post = postRepository.save(post);

//             if (!userId.equals(post.getUserId())) {
//                 User liker = userRepository.findById(userId)
//                         .orElseThrow(() -> new RuntimeException("User not found"));
//                 String message = String.format("%s liked your post", liker.getName());
//                 Notification notification = new Notification(
//                         post.getUserId(),
//                         userId,
//                         "LIKE",
//                         message,
//                         postId
//                 );
//                 notificationRepository.save(notification);
//                 messagingTemplate.convertAndSendToUser(
//                         post.getUserId(),
//                         "/queue/notifications",
//                         notification
//                 );
//             }
//         }
//         return post;
//     }

//     public Post unlikePost(String postId, String userId) {
//         Post post = postRepository.findById(postId)
//                 .orElseThrow(() -> new RuntimeException("Post not found"));
//         List<String> likedBy = post.getLikedBy();
//         if (likedBy.contains(userId)) {
//             likedBy.remove(userId);
//             post.setLikedBy(likedBy);
//             return postRepository.save(post);
//         }
//         return post;
//     }

//     public Comment addComment(String postId, String userId, String content) {
//         Post post = postRepository.findById(postId)
//                 .orElseThrow(() -> new RuntimeException("Post not found"));
//         Comment comment = new Comment(postId, userId, content);
//         Comment savedComment = commentRepository.save(comment);
//         post.getCommentIds().add(savedComment.getId());
//         postRepository.save(post);

//         if (!userId.equals(post.getUserId())) {
//             User commenter = userRepository.findById(userId)
//                     .orElseThrow(() -> new RuntimeException("Commenter not found"));
//             String message = String.format("%s commented on your post", commenter.getName());
//             Notification notification = new Notification(
//                     post.getUserId(),
//                     userId,
//                     "COMMENT",
//                     message,
//                     postId
//             );
//             notificationRepository.save(notification);
//             messagingTemplate.convertAndSendToUser(
//                     post.getUserId(),
//                     "/queue/notifications",
//                     notification
//             );
//         }

//         return savedComment;
//     }

//     public Comment editComment(String commentId, String userId, String content) {
//         Comment comment = commentRepository.findById(commentId)
//                 .orElseThrow(() -> new RuntimeException("Comment not found"));
//         if (!comment.getUserId().equals(userId)) {
//             throw new RuntimeException("You can only edit your own comments");
//         }
//         comment.setContent(content);
//         comment.setUpdatedAt(LocalDateTime.now());
//         return commentRepository.save(comment);
//     }

//     public void deleteComment(String commentId, String userId) {
//         Comment comment = commentRepository.findById(commentId)
//                 .orElseThrow(() -> new RuntimeException("Comment not found"));
//         if (!comment.getUserId().equals(userId)) {
//             throw new RuntimeException("You can only delete your own comments");
//         }
//         commentRepository.deleteById(commentId);
//         Post post = postRepository.findById(comment.getPostId())
//                 .orElseThrow(() -> new RuntimeException("Post not found"));
//         post.getCommentIds().remove(commentId);
//         postRepository.save(post);
//     }

//     public List<Comment> getCommentsByPostId(String postId) {
//         return commentRepository.findByPostIdOrderByCreatedAtDesc(postId);
//     }

//     public List<Post> getAllPosts() {
//         return postRepository.findAll();
//     }

//     public List<Post> getUserPosts(String userId) {
//         return postRepository.findByUserIdOrderByCreatedAtDesc(userId);
//     }

//     public List<Post> getVisiblePosts(String visibility, String userId) {
//         return postRepository.findByVisibilityAndUserId(visibility, userId);
//     }

//     public void deletePost(String postId) {
//         postRepository.deleteById(postId);
//     }

//     public Post savePost(Post post) {
//         return postRepository.save(post);
//     }
// }