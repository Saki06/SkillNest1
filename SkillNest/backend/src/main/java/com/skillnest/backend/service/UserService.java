package com.skillnest.backend.service;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.skillnest.backend.model.User;
import com.skillnest.backend.repository.UserRepository;

@Service
public class UserService {

    private static final Logger logger = LoggerFactory.getLogger(UserService.class);

    private final Path fileStorageLocation;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    public UserService(@Value("${file.upload-dir}") String uploadDir) throws IOException {
        this.fileStorageLocation = Paths.get(uploadDir).toAbsolutePath().normalize();
        if (Files.notExists(fileStorageLocation)) {
            Files.createDirectories(fileStorageLocation);
        }
    }

    public Optional<User> findById(String id) {
        return userRepository.findById(id);
    }

    public User updateUser(String id, User updatedUser) {
        return userRepository.findById(id).map(existing -> {
            if (updatedUser.getName() != null) {
                existing.setName(updatedUser.getName());
            }
            if (updatedUser.getHeadline() != null) {
                existing.setHeadline(updatedUser.getHeadline());
            }
            if (updatedUser.getBio() != null) {
                existing.setBio(updatedUser.getBio());
            }
            if (updatedUser.getTagline() != null) {
                existing.setTagline(updatedUser.getTagline());
            }
            if (updatedUser.getGender() != null) {
                existing.setGender(updatedUser.getGender());
            }
            if (updatedUser.getCountry() != null) {
                existing.setCountry(updatedUser.getCountry());
            }
            if (updatedUser.getState() != null) {
                existing.setState(updatedUser.getState());
            }
            if (updatedUser.getCity() != null) {
                existing.setCity(updatedUser.getCity());
            }
            if (updatedUser.getRole() != null) {
                existing.setRole(updatedUser.getRole());
            }
            if (updatedUser.getInstitution() != null) {
                existing.setInstitution(updatedUser.getInstitution());
            }
            if (updatedUser.getLanguage() != null) {
                existing.setLanguage(updatedUser.getLanguage());
            }
            if (updatedUser.getInternship() != null) {
                existing.setInternship(updatedUser.getInternship());
            }
            if (updatedUser.getFieldOfStudy() != null) {
                existing.setFieldOfStudy(updatedUser.getFieldOfStudy());
            }
            return userRepository.save(existing);
        }).orElseThrow(() -> new RuntimeException("User not found"));
    }

    public User uploadResume(String id, MultipartFile file) throws IOException {
        return userRepository.findById(id).map(user -> {
            try {
                String filename = UUID.randomUUID() + "_" + file.getOriginalFilename();
                Path targetLocation = fileStorageLocation.resolve(filename);
                Files.copy(file.getInputStream(), targetLocation, StandardCopyOption.REPLACE_EXISTING);
                user.setResume("/uploads/" + filename);
                return userRepository.save(user);
            } catch (IOException e) {
                throw new RuntimeException("Failed to upload resume", e);
            }
        }).orElseThrow(() -> new RuntimeException("User not found"));
    }

    public User deleteResume(String id) throws IOException {
        return userRepository.findById(id).map(user -> {
            if (user.getResume() == null) {
                return user; // No resume to delete
            }
            try {
                String resumePath = user.getResume().replace("/uploads/", "");
                Path filePath = fileStorageLocation.resolve(resumePath);
                if (Files.exists(filePath)) {
                    Files.delete(filePath);
                    logger.info("Deleted resume file: {}", filePath);
                }
                user.setResume(null);
                return userRepository.save(user);
            } catch (IOException e) {
                throw new RuntimeException("Failed to delete resume file", e);
            }
        }).orElseThrow(() -> new RuntimeException("User not found"));
    }

    public User updateSkills(String userId, List<String> newSkills) {
        return userRepository.findById(userId).map(user -> {
            user.setSkills(newSkills);
            return userRepository.save(user);
        }).orElseThrow(() -> new RuntimeException("User not found"));
    }

    public void follow(String followerId, String followedId) {
        if (followerId == null || followedId == null) {
            throw new IllegalArgumentException("Invalid user IDs");
        }
        if (followerId.equals(followedId)) {
            throw new IllegalArgumentException("Cannot follow yourself");
        }

        User follower = userRepository.findById(followerId)
                .orElseThrow(() -> new RuntimeException("Follower not found"));
        User followed = userRepository.findById(followedId)
                .orElseThrow(() -> new RuntimeException("User to follow not found"));

        if (follower.getFollowing().contains(followedId)) {
            logger.info("User {} already following {}", followerId, followedId);
            return;
        }

        follower.getFollowing().add(followedId);
        followed.getFollowers().add(followerId);

        userRepository.save(follower);
        userRepository.save(followed);
        logger.info("User {} followed {}", followerId, followedId);
    }

    public void unfollow(String followerId, String followedId) {
        if (followerId == null || followedId == null) {
            throw new IllegalArgumentException("Invalid user IDs");
        }

        User follower = userRepository.findById(followerId)
                .orElseThrow(() -> new RuntimeException("Follower not found"));
        User followed = userRepository.findById(followedId)
                .orElseThrow(() -> new RuntimeException("User to unfollow not found"));

        if (!follower.getFollowing().contains(followedId)) {
            logger.info("User {} not following {}", followerId, followedId);
            return;
        }

        follower.getFollowing().remove(followedId);
        followed.getFollowers().remove(followerId);

        userRepository.save(follower);
        userRepository.save(followed);
        logger.info("User {} unfollowed {}", followerId, followedId);
    }

    public Set<String> getFollowingIds(String userId) {
        return userRepository.findById(userId)
                .map(User::getFollowing)
                .orElse(Collections.emptySet());
    }

    public Set<String> getFollowerIds(String userId) {
        return userRepository.findById(userId)
                .map(User::getFollowers)
                .orElse(Collections.emptySet());
    }

    public Map<String, Integer> getFollowCounts(String userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        Map<String, Integer> counts = new HashMap<>();
        counts.put("followersCount", user.getFollowers().size());
        counts.put("followingCount", user.getFollowing().size());
        return counts;
    }
}