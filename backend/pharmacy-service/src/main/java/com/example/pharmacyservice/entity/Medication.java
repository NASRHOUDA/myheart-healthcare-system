package com.example.pharmacyservice.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.math.BigDecimal;

@Entity
@Table(name = "medications")
@Data
public class Medication {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(unique = true)
    private String code;
    
    @Column(nullable = false)
    private String name;
    
    private String genericName;
    private String manufacturer;
    private String category;
    
    @Column(precision = 10, scale = 2)
    private BigDecimal price;
    
    private Integer stockQuantity;
    private String unit; // comprimé, ml, g, etc.
    
    private Boolean requiresPrescription;
    private String dosageForm; // comprimé, sirop, injection
    private String strength; // 500mg, 10mg/ml
    
    @Column(length = 500)
    private String description;
}
