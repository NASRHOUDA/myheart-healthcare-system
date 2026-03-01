package com.example.pharmacyservice.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class PrescriptionDTO {
    private Long id;
    private Long patientId;
    private Long doctorId;
    private Long appointmentId;
    private String medicationName;
    private String medicationCode;
    private String dosage;
    private String frequency;
    private String duration;
    private String instructions;
    private String status;
    private LocalDateTime prescribedDate;
    private LocalDateTime expiryDate;
}
