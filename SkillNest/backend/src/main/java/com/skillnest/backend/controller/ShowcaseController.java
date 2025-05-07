package com.skillnest.backend.controller;


import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.skillnest.backend.model.Showcase;
import com.skillnest.backend.repository.ShowcaseRepository;

@RestController
@RequestMapping("/api/auth/users/{userId}/showcases")
public class ShowcaseController {

    private final ShowcaseRepository showcaseRepository;

    @Value("${file.upload-dir}")
    private String uploadDir;

    public ShowcaseController(ShowcaseRepository showcaseRepository) {
        this.showcaseRepository = showcaseRepository;
    }

    @GetMapping
    public ResponseEntity<List<Showcase>> getShowcases(@PathVariable String userId) {
        List<Showcase> showcases = showcaseRepository.findByUserId(userId);
        return ResponseEntity.ok(showcases);
    }

    @PostMapping
    public ResponseEntity<?> createShowcase(
            @PathVariable String userId,
            @RequestParam("title") String title,
            @RequestParam("description") String description,
            @RequestParam(value = "skills", required = false) List<String> skills,
            @RequestParam("visibility") String visibility,
            @RequestParam(value = "file", required = false) MultipartFile file,
            @RequestParam(value = "projectUrl", required = false) String projectUrl
    ) {
        try {
            Showcase showcase = new Showcase();
            showcase.setUserId(userId);
            showcase.setTitle(title);
            showcase.setDescription(description);
            showcase.setSkills(skills);
            showcase.setVisibility(visibility);
            showcase.setProjectUrl(projectUrl);
            showcase.setCreatedAt(LocalDateTime.now());
            showcase.setUpdatedAt(LocalDateTime.now());

            if (file != null && !file.isEmpty()) {
                String fileName = UUID.randomUUID().toString() + "_" + file.getOriginalFilename();
                Path filePath = Paths.get(uploadDir, fileName);
                Files.createDirectories(filePath.getParent());
                file.transferTo(filePath);
                showcase.setFilePath("/uploads/" + fileName);
            }

            Showcase savedShowcase = showcaseRepository.save(showcase);
            return ResponseEntity.status(HttpStatus.CREATED).body(savedShowcase);
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to upload file: " + e.getMessage());
        }
    }

    @PutMapping("/{showcaseId}")
    public ResponseEntity<?> updateShowcase(
            @PathVariable String userId,
            @PathVariable String showcaseId,
            @RequestParam("title") String title,
            @RequestParam("description") String description,
            @RequestParam(value = "skills", required = false) List<String> skills,
            @RequestParam("visibility") String visibility,
            @RequestParam(value = "file", required = false) MultipartFile file,
            @RequestParam(value = "projectUrl", required = false) String projectUrl
    ) {
        try {
            Optional<Showcase> optionalShowcase = showcaseRepository.findById(showcaseId);
            if (!optionalShowcase.isPresent()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body("Showcase not found");
            }

            Showcase showcase = optionalShowcase.get();
            if (!showcase.getUserId().equals(userId)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body("You can only edit your own showcases");
            }

            showcase.setTitle(title);
            showcase.setDescription(description);
            showcase.setSkills(skills);
            showcase.setVisibility(visibility);
            showcase.setProjectUrl(projectUrl);
            showcase.setUpdatedAt(LocalDateTime.now());

            if (file != null && !file.isEmpty()) {
                // Delete old file if exists
                if (showcase.getFilePath() != null) {
                    Path oldFilePath = Paths.get(uploadDir, showcase.getFilePath().substring("/uploads/".length()));
                    Files.deleteIfExists(oldFilePath);
                }

                String fileName = UUID.randomUUID().toString() + "_" + file.getOriginalFilename();
                Path filePath = Paths.get(uploadDir, fileName);
                Files.createDirectories(filePath.getParent());
                file.transferTo(filePath);
                showcase.setFilePath("/uploads/" + fileName);
            }

            Showcase updatedShowcase = showcaseRepository.save(showcase);
            return ResponseEntity.ok(updatedShowcase);
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to upload file: " + e.getMessage());
        }
    }

    @DeleteMapping("/{showcaseId}")
    public ResponseEntity<?> deleteShowcase(
            @PathVariable String userId,
            @PathVariable String showcaseId
    ) {
        Optional<Showcase> optionalShowcase = showcaseRepository.findById(showcaseId);
        if (!optionalShowcase.isPresent()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("Showcase not found");
        }

        Showcase showcase = optionalShowcase.get();
        if (!showcase.getUserId().equals(userId)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body("You can only delete your own showcases");
        }

        try {
            if (showcase.getFilePath() != null) {
                Path filePath = Paths.get(uploadDir, showcase.getFilePath().substring("/uploads/".length()));
                Files.deleteIfExists(filePath);
            }
            showcaseRepository.deleteById(showcaseId);
            return ResponseEntity.ok().build();
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to delete file: " + e.getMessage());
        }
    }

    @GetMapping("/files/{filename:.+}")
    public ResponseEntity<?> serveFile(@PathVariable String filename) {
        try {
            Path filePath = Paths.get(uploadDir, filename);
            if (!Files.exists(filePath)) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body("File not found");
            }

            byte[] fileBytes = Files.readAllBytes(filePath);
            String contentType = Files.probeContentType(filePath);
            return ResponseEntity.ok()
                    .header("Content-Type", contentType)
                    .body(fileBytes);
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to serve file: " + e.getMessage());
        }
    }
    @GetMapping("/view/{filename:.+}")
public ResponseEntity<byte[]> viewFile(@PathVariable String filename) {
    try {
        Path filePath = Paths.get("C:/SkillNestUploads", filename);
        if (!Files.exists(filePath)) {
            return ResponseEntity.notFound().build();
        }

        byte[] fileBytes = Files.readAllBytes(filePath);
        String contentType = Files.probeContentType(filePath);

        return ResponseEntity.ok()
                .header("Content-Type", contentType)
                .body(fileBytes);
    } catch (IOException e) {
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
    }
}

}