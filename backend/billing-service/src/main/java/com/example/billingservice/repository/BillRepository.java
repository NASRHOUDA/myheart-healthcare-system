package com.example.billingservice.repository;

import com.example.billingservice.entity.Bill;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface BillRepository extends JpaRepository<Bill, Long> {
    List<Bill> findByPatientId(Long patientId);
    List<Bill> findByAppointmentId(Long appointmentId);
    List<Bill> findByStatus(String status);
}
