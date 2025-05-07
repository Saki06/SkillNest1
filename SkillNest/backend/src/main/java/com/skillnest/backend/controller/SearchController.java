package com.skillnest.backend.controller;

import java.util.List;
import java.util.Map;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.skillnest.backend.model.Search;
import com.skillnest.backend.service.SearchService;

@RestController
@RequestMapping("/api/search")
public class SearchController {
    private final SearchService searchService;

    public SearchController(SearchService searchService) {
        this.searchService = searchService;
    }

    @GetMapping("/members")
    public List<Search> searchMembers(
        @RequestParam(required = false) String query,
        @RequestParam(required = false) String country,
        @RequestParam(required = false) String institution,
        @RequestParam(required = false) String fieldOfStudy,
        @RequestParam(required = false) String skills,
        @RequestParam(required = false) String internship
    ) {
        return searchService.searchMembers(query, country, institution, fieldOfStudy, skills, internship);
    }

    @GetMapping("/filters")
    public Map<String, List<String>> getFilterOptions() {
        return searchService.getFilterOptions();
    }
}