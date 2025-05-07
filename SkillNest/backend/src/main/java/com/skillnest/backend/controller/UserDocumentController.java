package com.skillnest.backend.controller;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.skillnest.backend.model.UserDocument;
import com.skillnest.backend.repository.UserDocumentRepository;

@RestController
@RequestMapping("/api/auth/users/{userId}/documents")
@CrossOrigin(origins = "http://localhost:5173")
public class UserDocumentController {

    @Value("${file.upload-dir}")
    private String uploadDir;

    @Autowired
    private UserDocumentRepository documentRepository;

    // Upload Document or Certificate
    @PostMapping
    public ResponseEntity<?> uploadDocument(
            @PathVariable String userId,
            @RequestParam(value = "file", required = false) MultipartFile file,
            @RequestParam("type") String type,
            @RequestParam("name") String name,
            @RequestParam("description") String description,
            @RequestParam("visibility") String visibility,
            @RequestParam(required = false) String folder,
            @RequestParam(required = false) List<String> tags,
            @RequestParam(value = "issuingOrganization", required = false) String issuingOrganization,
            @RequestParam(value = "credentialUrl", required = false) String credentialUrl
    ) {
        try {
            if (!type.equals("document") && !type.equals("certificate")) {
                return ResponseEntity.badRequest().body("Invalid type: must be 'document' or 'certificate'");
            }

            if (type.equals("certificate") && issuingOrganization == null) {
                return ResponseEntity.badRequest().body("Issuing organization is required for certificates");
            }

            String filePath = null;
            if (file != null && !file.isEmpty()) {
                File directory = new File(uploadDir);
                if (!directory.exists()) {
                    directory.mkdirs();
                }

                String filename = UUID.randomUUID() + "_" + StringUtils.cleanPath(file.getOriginalFilename());
                filePath = uploadDir + File.separator + filename;
                Files.copy(file.getInputStream(), Paths.get(filePath));
            } else if (type.equals("document")) {
                return ResponseEntity.badRequest().body("File is required for documents");
            }

            UserDocument doc = new UserDocument();
            doc.setUserId(userId);
            doc.setType(type);
            doc.setName(name);
            doc.setDescription(description);
            doc.setVisibility(visibility);
            doc.setFolder(folder);
            doc.setTags(tags);
            doc.setFilePath(filePath);
            doc.setUploadedAt(LocalDateTime.now());

            if (type.equals("certificate")) {
                doc.setIssuingOrganization(issuingOrganization);
                doc.setCredentialUrl(credentialUrl);
            }

            UserDocument saved = documentRepository.save(doc);
            return ResponseEntity.ok(saved);
        } catch (IOException e) {
            return ResponseEntity.status(500).body("Failed to upload file: " + e.getMessage());
        }
    }

    // Get All Documents by User
    @GetMapping
    public ResponseEntity<List<UserDocument>> getUserDocuments(@PathVariable String userId) {
        return ResponseEntity.ok(documentRepository.findByUserId(userId));
    }

    // Delete Document
    @DeleteMapping("/{docId}")
    public ResponseEntity<?> deleteDocument(@PathVariable String docId) {
        return documentRepository.findById(docId)
                .map(doc -> {
                    try {
                        if (doc.getFilePath() != null) {
                            Path path = Paths.get(doc.getFilePath());
                            Files.deleteIfExists(path);
                        }
                    } catch (IOException e) {
                        e.printStackTrace();
                    }
                    documentRepository.deleteById(docId);
                    return ResponseEntity.ok().build();
                })
                .orElse(ResponseEntity.notFound().build());
    }

    // Update Document or Certificate
    @PutMapping("/{docId}")
    public ResponseEntity<?> updateDocument(
            @PathVariable String docId,
            @RequestParam(value = "file", required = false) MultipartFile file,
            @RequestParam("type") String type,
            @RequestParam("name") String name,
            @RequestParam("description") String description,
            @RequestParam("visibility") String visibility,
            @RequestParam(required = false) String folder,
            @RequestParam(required = false) List<String> tags,
            @RequestParam(value = "issuingOrganization", required = false) String issuingOrganization,
            @RequestParam(value = "credentialUrl", required = false) String credentialUrl
    ) {
        return documentRepository.findById(docId)
                .map(doc -> {
                    if (!type.equals("document") && !type.equals("certificate")) {
                        return ResponseEntity.badRequest().body("Invalid type: must be 'document' or 'certificate'");
                    }

                    if (type.equals("certificate") && issuingOrganization == null) {
                        return ResponseEntity.badRequest().body("Issuing organization is required for certificates");
                    }

                    try {
                        String filePath = doc.getFilePath();
                        if (file != null && !file.isEmpty()) {
                            // Delete old file if exists
                            if (filePath != null) {
                                Files.deleteIfExists(Paths.get(filePath));
                            }
                            // Save new file
                            File directory = new File(uploadDir);
                            if (!directory.exists()) {
                                directory.mkdirs();
                            }
                            String filename = UUID.randomUUID() + "_" + StringUtils.cleanPath(file.getOriginalFilename());
                            filePath = uploadDir + File.separator + filename;
                            Files.copy(file.getInputStream(), Paths.get(filePath));
                        }

                        doc.setType(type);
                        doc.setName(name);
                        doc.setDescription(description);
                        doc.setVisibility(visibility);
                        doc.setFolder(folder);
                        doc.setTags(tags);
                        doc.setFilePath(filePath);

                        if (type.equals("certificate")) {
                            doc.setIssuingOrganization(issuingOrganization);
                            doc.setCredentialUrl(credentialUrl);
                        } else {
                            doc.setIssuingOrganization(null);
                            doc.setCredentialUrl(null);
                        }

                        return ResponseEntity.ok(documentRepository.save(doc));
                    } catch (IOException e) {
                        return ResponseEntity.status(500).body("Failed to update file: " + e.getMessage());
                    }
                })
                .orElse(ResponseEntity.notFound().build());
    }
}