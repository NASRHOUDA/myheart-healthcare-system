package com.example.patientservice.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class PatientDTO {
    private Long id;
    private String firstName;
    private String lastName;
    private String email;
    private String phone;
    private String address;
    private LocalDateTime dateOfBirth;
    private String socialSecurityNumber;
}
