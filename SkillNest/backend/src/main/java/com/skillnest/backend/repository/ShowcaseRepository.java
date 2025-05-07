package com.skillnest.backend.repository;
import com.skillnest.backend.model.Showcase;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;

public interface ShowcaseRepository extends MongoRepository<Showcase, String> {
    List<Showcase> findByUserId(String userId);
}