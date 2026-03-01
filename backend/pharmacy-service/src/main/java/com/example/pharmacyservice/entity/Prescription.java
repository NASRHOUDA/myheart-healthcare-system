package com.example.pharmacyservice.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Table(name = "prescriptions")
@Data
public class Prescription {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false)
    private Long patientId;
    
    private Long doctorId;
    private Long appointmentId;
    
    @Column(nullable = false)
    private String medicationName;
    
    private String medicationCode;
    
    @Column(nullable = false)
    private String dosage; // ex: "1 comprimé"
    
    @Column(nullable = false)
    private String frequency; // ex: "2 fois par jour"
    
    private String duration; // ex: "7 jours"
    
    @Column(length = 500)
    private String instructions; // ex: "À prendre pendant le repas"
    
    private String status; // ACTIVE, DISPENSED, CANCELLED, EXPIRED
    
    private LocalDateTime prescribedDate;
    private LocalDateTime dispensedDate;
    private LocalDateTime expiryDate;
    
    private String dispensedBy; // Nom du pharmacien
    
    @PrePersist
    protected void onCreate() {
        prescribedDate = LocalDateTime.now();
        if (status == null) status = "ACTIVE";
        if (expiryDate == null) expiryDate = LocalDateTime.now().plusMonths(6);
    }
}
