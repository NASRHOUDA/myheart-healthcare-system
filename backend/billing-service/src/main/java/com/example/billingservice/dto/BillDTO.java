package com.example.billingservice.dto;

import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class BillDTO {
    private Long id;
    private Long appointmentId;
    private Long patientId;
    private BigDecimal amount;
    private String description;
    private String status;
    private LocalDateTime dueDate;
    private LocalDateTime paidDate;
    private String paymentMethod;
}
