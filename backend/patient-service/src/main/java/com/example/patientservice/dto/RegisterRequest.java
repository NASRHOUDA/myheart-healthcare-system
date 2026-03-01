package com.example.patientservice.dto;

import lombok.Data;

@Data
public class RegisterRequest {
    private String email;
    private String password;
    private String role;
    private String firstName;
    private String lastName;
    private String phone;
    private String address;
    private String specialty;
    private String licenseNumber;
    private String employeeId;
    private String department;
}
