package com.skillnest.backend.repository;

import java.util.List;

import org.springframework.data.mongodb.repository.Aggregation;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;

import com.skillnest.backend.model.Search;

public interface SearchRepository extends MongoRepository<Search, String> {
    // Note: Consider adding a text index on fullName for better search performance
    // @TextIndexed on fullName in Search class and use $text search instead of regex
    @Query("{'$or': [{ 'fullName': { '$regex': ?0, '$options': 'i' }}, { 'firstName': { '$regex': ?0, '$options': 'i' }}, { 'lastName': { '$regex': ?0, '$options': 'i' }}]}")
    List<Search> searchMembers(String query);

    // Distinct filter values with case-insensitive sorting
    @Aggregation(pipeline = {
        "{'$group': { '_id': { '$toLower': '$country' }}}",
        "{'$sort': { '_id': 1 }}"
    })
    List<String> findDistinctCountries();

    @Aggregation(pipeline = {
        "{'$group': { '_id': { '$toLower': '$institution' }}}",
        "{'$sort': { '_id': 1 }}"
    })
    List<String> findDistinctInstitutions();

    @Aggregation(pipeline = {
        "{'$group': { '_id': { '$toLower': '$fieldOfStudy' }}}",
        "{'$sort': { '_id': 1 }}"
    })
    List<String> findDistinctFieldsOfStudy();

    @Aggregation(pipeline = {
        "{'$unwind': '$skills'}",
        "{'$group': { '_id': { '$toLower': '$skills' }}}",
        "{'$sort': { '_id': 1 }}"
    })
    List<String> findDistinctSkills();

    @Aggregation(pipeline = {
        "{'$group': { '_id': { '$toLower': '$internship' }}}",
        "{'$sort': { '_id': 1 }}"
    })
    List<String> findDistinctInternships();
}