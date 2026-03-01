package com.example.billingservice.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "bills")
@Data
public class Bill {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    private Long appointmentId;
    private Long patientId;
    private BigDecimal amount;
    private String description;
    private String status; // PENDING, PAID, CANCELLED
    private LocalDateTime dueDate;
    private LocalDateTime paidDate;
    private String paymentMethod;
    
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        if (status == null) status = "PENDING";
        if (dueDate == null) dueDate = LocalDateTime.now().plusDays(30);
    }
    
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
