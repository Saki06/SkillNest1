package com.skillnest.backend.service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.skillnest.backend.model.Search;
import com.skillnest.backend.repository.SearchRepository;

@Service
public class SearchService {
    private final SearchRepository searchRepository;

    public SearchService(SearchRepository searchRepository) {
        this.searchRepository = searchRepository;
    }

    public List<Search> searchMembers(String query, String country, String institution, String fieldOfStudy, String skills, String internship) {
        List<Search> results = query != null && !query.isEmpty() 
            ? searchRepository.searchMembers(query)
            : searchRepository.findAll();

        // Apply filters
        results = results.stream()
            .filter(m -> country == null || country.isEmpty() || country.equalsIgnoreCase(m.getCountry()))
            .filter(m -> institution == null || institution.isEmpty() || institution.equalsIgnoreCase(m.getInstitution()))
            .filter(m -> fieldOfStudy == null || fieldOfStudy.isEmpty() || fieldOfStudy.equalsIgnoreCase(m.getFieldOfStudy()))
            .filter(m -> skills == null || skills.isEmpty() || (m.getSkills() != null && m.getSkills().stream().anyMatch(s -> s.equalsIgnoreCase(skills))))
            .filter(m -> internship == null || internship.isEmpty() || internship.equalsIgnoreCase(m.getInternship()))
            .collect(Collectors.toList());

        return results;
    }

    public Map<String, List<String>> getFilterOptions() {
        Map<String, List<String>> filters = new HashMap<>();
        filters.put("countries", searchRepository.findDistinctCountries().stream().filter(c -> c != null).collect(Collectors.toList()));
        filters.put("institutions", searchRepository.findDistinctInstitutions().stream().filter(i -> i != null).collect(Collectors.toList()));
        filters.put("fieldsOfStudy", searchRepository.findDistinctFieldsOfStudy().stream().filter(f -> f != null).collect(Collectors.toList()));
        filters.put("skills", searchRepository.findDistinctSkills().stream().filter(s -> s != null).collect(Collectors.toList()));
        filters.put("internships", searchRepository.findDistinctInternships().stream().filter(i -> i != null).collect(Collectors.toList()));
        return filters;
    }
}