package com.example.pharmacyservice.dto;

import lombok.Data;
import java.math.BigDecimal;

@Data
public class MedicationDTO {
    private Long id;
    private String code;
    private String name;
    private String genericName;
    private String manufacturer;
    private String category;
    private BigDecimal price;
    private Integer stockQuantity;
    private String unit;
    private Boolean requiresPrescription;
    private String dosageForm;
    private String strength;
    private String description;
}
