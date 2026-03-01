package com.example.patientservice.dto;

import lombok.Data;

@Data
public class LoginResponse {
    private Long id;
    private String email;
    private String role;
    private String firstName;
    private String lastName;
    private String token;
    private Long patientId;
}
