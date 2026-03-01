package com.example.patientservice.dto;

import lombok.Data;

@Data
public class UserDTO {
    private Long id;
    private String email;
    private String role;
    private String firstName;
    private String lastName;
    private String phone;
    private String address;
    private Long patientId;
}
