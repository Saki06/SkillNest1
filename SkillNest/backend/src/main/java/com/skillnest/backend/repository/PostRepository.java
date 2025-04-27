package com.skillnest.backend.repository;

import java.util.List;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import com.skillnest.backend.model.Post;

@Repository
public interface PostRepository extends MongoRepository<Post, String> {

    List<Post> findByUserIdOrderByCreatedAtDesc(String userId);

    List<Post> findByVisibilityAndUserId(String visibility, String userId);
}
