package com.skillnest.backend.model;

import java.util.List;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import jakarta.validation.constraints.NotBlank;

@Document(collection = "members")
public class Search {

    @Id
    private String id;

    @Indexed
    @NotBlank(message = "Full name is required")
    private String fullName;

    private String firstName;

    private String lastName;

    private String country;

    private String institution;

    private String fieldOfStudy;

    private List<String> skills;

    private String internship;

    // Getters and Setters
    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public String getFirstName() {
        return firstName;
    }

    public void setFirstName(String firstName) {
        this.firstName = firstName;
    }

    public String getLastName() {
        return lastName;
    }

    public void setLastName(String lastName) {
        this.lastName = lastName;
    }

    public String getCountry() {
        return country;
    }

    public void setCountry(String country) {
        this.country = country;
    }

    public String getInstitution() {
        return institution;
    }

    public void setInstitution(String institution) {
        this.institution = institution;
    }

    public String getFieldOfStudy() {
        return fieldOfStudy;
    }

    public void setFieldOfStudy(String fieldOfStudy) {
        this.fieldOfStudy = fieldOfStudy;
    }

    public List<String> getSkills() {
        return skills;
    }

    public void setSkills(List<String> skills) {
        this.skills = skills;
    }

    public String getInternship() {
        return internship;
    }

    public void setInternship(String internship) {
        this.internship = internship;
    }

    @Override
    public String toString() {
        return "Search{" +
                "id='" + id + '\'' +
                ", fullName='" + fullName + '\'' +
                ", firstName='" + firstName + '\'' +
                ", lastName='" + lastName + '\'' +
                ", country='" + country + '\'' +
                ", institution='" + institution + '\'' +
                ", fieldOfStudy='" + fieldOfStudy + '\'' +
                ", skills=" + skills +
                ", internship='" + internship + '\'' +
                '}';
    }
}