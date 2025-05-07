package com.skillnest.backend.controller;

import java.io.IOException;
import java.security.GeneralSecurityException;
import java.util.Base64;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.util.UriComponentsBuilder;

import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import com.google.api.client.googleapis.javanet.GoogleNetHttpTransport;
import com.google.api.client.json.gson.GsonFactory;
import com.skillnest.backend.model.User;
import com.skillnest.backend.repository.UserRepository;
import com.skillnest.backend.security.JwtUtil;
import com.skillnest.backend.service.UserService;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private static final Logger logger = LoggerFactory.getLogger(AuthController.class);

    @Autowired
    private UserRepository userRepo;

    @Autowired
    private UserService userService;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Value("${google.client-id}")
    private String GOOGLE_CLIENT_ID;

    @Value("${google.client-secret}")
    private String GOOGLE_CLIENT_SECRET;

    @Value("${google.redirect-uri}")
    private String GOOGLE_REDIRECT_URI;

    @GetMapping("/google/login")
    public ResponseEntity<?> initiateGoogleLogin() {
        String googleAuthUrl = "https://accounts.google.com/o/oauth2/v2/auth" +
                "?client_id=" + GOOGLE_CLIENT_ID +
                "&redirect_uri=" + GOOGLE_REDIRECT_URI +
                "&response_type=code" +
                "&scope=openid%20email%20profile" +
                "&access_type=offline" +
                "&prompt=consent";

        Map<String, String> response = new HashMap<>();
        response.put("auth_url", googleAuthUrl);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/google/callback")
    public ResponseEntity<?> googleCallback(@RequestParam("code") String code) {
        try {
            // Exchange authorization code for access token
            RestTemplate restTemplate = new RestTemplate();
            Map<String, String> tokenRequest = new HashMap<>();
            tokenRequest.put("code", code);
            tokenRequest.put("client_id", GOOGLE_CLIENT_ID);
            tokenRequest.put("client_secret", GOOGLE_CLIENT_SECRET);
            tokenRequest.put("redirect_uri", GOOGLE_REDIRECT_URI);
            tokenRequest.put("grant_type", "authorization_code");

            Map<String, String> tokenResponse = restTemplate.postForObject(
                    "https://oauth2.googleapis.com/token", tokenRequest, Map.class);

            String idToken = tokenResponse.get("id_token");

            // Verify the ID token and extract user info
            GoogleIdTokenVerifier verifier;
            try {
                verifier = new GoogleIdTokenVerifier.Builder(
                        GoogleNetHttpTransport.newTrustedTransport(), GsonFactory.getDefaultInstance())
                        .setAudience(List.of(GOOGLE_CLIENT_ID))
                        .build();
            } catch (GeneralSecurityException | IOException e) {
                logger.error("Failed to initialize GoogleIdTokenVerifier: {}", e.getMessage());
                throw new RuntimeException("Failed to initialize GoogleIdTokenVerifier", e);
            }

            GoogleIdToken googleIdToken = verifier.verify(idToken);
            if (googleIdToken == null) {
                throw new RuntimeException("Invalid ID token");
            }

            GoogleIdToken.Payload payload = googleIdToken.getPayload();
            String email = payload.getEmail();
            String name = (String) payload.get("name");
            String picture = (String) payload.get("picture");

            // Find or create user
            Optional<User> userOpt = userRepo.findByEmail(email);
            User user;
            if (userOpt.isPresent()) {
                user = userOpt.get();
                // Check if the user is registered for Google login
                if (!"google".equals(user.getLoginMethod())) {
                    throw new RuntimeException("User is registered with a different login method. Please use manual login.");
                }
            } else {
                // Create new user for Google login
                user = new User();
                user.setEmail(email);
                user.setName(name);
                user.setProfileImage(picture);
                user.setLoginMethod("google");
                user.setCreatedAt(new Date());
                user = userRepo.save(user);
            }

            // Generate JWT token
            String token = jwtUtil.generateToken(user.getId());

            // Redirect to frontend with token and user data in query params
            String redirectUrl = UriComponentsBuilder
                    .fromUriString("http://localhost:5173/auth/google/callback")
                    .queryParam("token", token)
                    .queryParam("user", java.net.URLEncoder.encode(new com.google.gson.Gson().toJson(user), "UTF-8"))
                    .build()
                    .toUriString();

            return ResponseEntity.status(HttpStatus.FOUND)
                    .header("Location", redirectUrl)
                    .build();
        } catch (Exception e) {
            logger.error("Google OAuth callback error: {}", e.getMessage());
            String errorRedirectUrl = UriComponentsBuilder
                    .fromUriString("http://localhost:5173/auth/google/callback")
                    .build()
                    .toUriString();

            return ResponseEntity.status(HttpStatus.FOUND)
                    .header("Location", errorRedirectUrl)
                    .build();
        }
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody User user) {
        if (user.getName() == null || user.getName().trim().isEmpty()) {
            return ResponseEntity.badRequest().body("Name is required");
        }

        if (userRepo.findByEmail(user.getEmail()).isPresent()) {
            return ResponseEntity.badRequest().body("User already exists");
        }

        user.setPassword(passwordEncoder.encode(user.getPassword()));
        user.setLoginMethod("manual");
        user.setCreatedAt(new Date());

        try {
            return ResponseEntity.ok(userRepo.save(user));
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Registration failed: " + e.getMessage());
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody User user) {
        Optional<User> found = userRepo.findByEmail(user.getEmail());

        if (found.isEmpty() || !passwordEncoder.matches(user.getPassword(), found.get().getPassword())) {
            return ResponseEntity.status(401).body("Invalid credentials");
        }

        String token = jwtUtil.generateToken(found.get().getId());
        Map<String, Object> res = new HashMap<>();
        res.put("token", token);
        res.put("user", found.get());
        return ResponseEntity.ok(res);
    }

    @GetMapping("/users/{id}")
    public ResponseEntity<?> getUserById(@PathVariable String id) {
        return userRepo.findById(id)
                .<ResponseEntity<?>>map(ResponseEntity::ok)
                .orElse(ResponseEntity.status(404).body("User not found"));
    }

    @PostMapping("/users/{id}/cover")
    public ResponseEntity<?> uploadCover(@PathVariable String id, @RequestParam("coverImage") MultipartFile file) {
        try {
            Optional<User> userOpt = userRepo.findById(id);
            if (userOpt.isEmpty()) return ResponseEntity.status(404).body("User not found");

            User user = userOpt.get();
            String base64Image = Base64.getEncoder().encodeToString(file.getBytes());
            user.setCoverImage("data:" + file.getContentType() + ";base64," + base64Image);
            return ResponseEntity.ok(userRepo.save(user));
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error uploading image");
        }
    }

    @DeleteMapping("/users/{id}/cover")
    public ResponseEntity<?> deleteCover(@PathVariable String id, @RequestHeader(value = "Authorization", required = false) String authHeader) {
        try {
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                return ResponseEntity.status(401).body("Missing or malformed token");
            }

            String userId = jwtUtil.validateToken(authHeader.replace("Bearer ", ""));
            if (userId == null || !userId.equals(id)) {
                return ResponseEntity.status(403).body("Invalid or unauthorized token");
            }

            Optional<User> userOpt = userRepo.findById(id);
            if (userOpt.isEmpty()) {
                return ResponseEntity.status(404).body("User not found");
            }

            User user = userOpt.get();
            user.setCoverImage(null);
            return ResponseEntity.ok(userRepo.save(user));
        } catch (Exception e) {
            logger.error("Error deleting cover image: {}", e.getMessage());
            return ResponseEntity.status(500).body("Error deleting cover image");
        }
    }

    @PostMapping("/users/{id}/profile")
    public ResponseEntity<?> uploadProfileImage(@PathVariable String id, @RequestParam("profileImage") MultipartFile file) {
        try {
            Optional<User> userOpt = userRepo.findById(id);
            if (userOpt.isEmpty()) return ResponseEntity.status(404).body("User not found");

            User user = userOpt.get();
            String base64Image = Base64.getEncoder().encodeToString(file.getBytes());
            user.setProfileImage("data:" + file.getContentType() + ";base64," + base64Image);
            return ResponseEntity.ok(userRepo.save(user));
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Upload error: " + e.getMessage());
        }
    }

    @DeleteMapping("/users/{id}/profile")
    public ResponseEntity<?> deleteProfileImage(@PathVariable String id, @RequestHeader(value = "Authorization", required = false) String authHeader) {
        try {
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                return ResponseEntity.status(401).body("Missing or malformed token");
            }

            String userId = jwtUtil.validateToken(authHeader.replace("Bearer ", ""));
            if (userId == null || !userId.equals(id)) {
                return ResponseEntity.status(403).body("Invalid or unauthorized token");
            }

            Optional<User> userOpt = userRepo.findById(id);
            if (userOpt.isEmpty()) {
                return ResponseEntity.status(404).body("User not found");
            }

            User user = userOpt.get();
            user.setProfileImage(null);
            return ResponseEntity.ok(userRepo.save(user));
        } catch (Exception e) {
            logger.error("Error deleting profile image: {}", e.getMessage());
            return ResponseEntity.status(500).body("Error deleting profile image");
        }
    }

    @PostMapping("/users/{id}/resume")
    public ResponseEntity<?> uploadResume(@PathVariable String id, @RequestParam("resume") MultipartFile file) {
        try {
            return ResponseEntity.ok(userService.uploadResume(id, file));
        } catch (IOException e) {
            return ResponseEntity.status(500).body("Resume upload failed");
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body("User not found");
        }
    }

    @PutMapping("/users/{id}")
    public ResponseEntity<?> updateUser(@PathVariable String id, @RequestBody User user) {
        try {
            return ResponseEntity.ok(userService.updateUser(id, user));
        } catch (RuntimeException e) {
            return ResponseEntity.status(404).body("User not found");
        }
    }

    @PutMapping("/users/{id}/skills")
    public ResponseEntity<?> updateSkills(@PathVariable String id, @RequestBody Map<String, List<String>> body) {
        Optional<User> userOpt = userRepo.findById(id);
        if (userOpt.isEmpty()) return ResponseEntity.status(404).body("User not found");

        User user = userOpt.get();
        List<String> skills = body.get("skills");
        user.setSkills(skills);
        return ResponseEntity.ok(userRepo.save(user));
    }

    @GetMapping("/users/{id}/skills")
    public ResponseEntity<?> getSkills(@PathVariable String id) {
        Optional<User> userOpt = userRepo.findById(id);
        if (userOpt.isEmpty()) return ResponseEntity.status(404).body("User not found");
        return ResponseEntity.ok(userOpt.get().getSkills());
    }

    @PostMapping("/follow")
    public ResponseEntity<?> follow(@RequestBody Map<String, String> body,
                                    @RequestHeader(value = "Authorization", required = false) String authHeader) {
        try {
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                return ResponseEntity.status(401).body("Missing or malformed token");
            }

            String followerId = jwtUtil.validateToken(authHeader.replace("Bearer ", ""));
            if (followerId == null) {
                return ResponseEntity.status(403).body("Invalid or expired token");
            }

            String followedId = body.get("userIdToFollow");
            if (followedId == null) {
                return ResponseEntity.badRequest().body("Missing userId to follow");
            }

            userService.follow(followerId, followedId);
            return ResponseEntity.ok("Followed successfully");
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (RuntimeException e) {
            return ResponseEntity.status(400).body(e.getMessage());
        }
    }

    @PostMapping("/unfollow")
    public ResponseEntity<?> unfollow(@RequestBody Map<String, String> body,
                                      @RequestHeader(value = "Authorization", required = false) String authHeader) {
        try {
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                return ResponseEntity.status(401).body("Missing or malformed token");
            }

            String followerId = jwtUtil.validateToken(authHeader.replace("Bearer ", ""));
            if (followerId == null) {
                return ResponseEntity.status(403).body("Invalid or expired token");
            }

            String followedId = body.get("userIdToUnfollow");
            if (followedId == null) {
                return ResponseEntity.badRequest().body("Missing userId to unfollow");
            }

            userService.unfollow(followerId, followedId);
            return ResponseEntity.ok("Unfollowed successfully");
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (RuntimeException e) {
            return ResponseEntity.status(400).body(e.getMessage());
        }
    }

    @GetMapping("/followers/{userId}")
    public ResponseEntity<Set<String>> getFollowers(@PathVariable String userId) {
        return ResponseEntity.ok(userService.getFollowerIds(userId));
    }

    @GetMapping("/following/{userId}")
    public ResponseEntity<Set<String>> getFollowing(@PathVariable String userId) {
        return ResponseEntity.ok(userService.getFollowingIds(userId));
    }

    @GetMapping("/users/{userId}/counts")
    public ResponseEntity<?> getCounts(@PathVariable String userId) {
        return ResponseEntity.ok(userService.getFollowCounts(userId));
    }

    @GetMapping("/users")
    public ResponseEntity<List<User>> getAllUsers() {
        List<User> users = userRepo.findAll();
        return ResponseEntity.ok(users);
    }
}