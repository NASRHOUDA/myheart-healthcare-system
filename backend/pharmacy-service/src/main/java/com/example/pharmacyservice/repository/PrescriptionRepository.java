package com.example.pharmacyservice.repository;

import com.example.pharmacyservice.entity.Prescription;
import org.springframework.data.jpa.repository.JpaRepository;
import java.time.LocalDateTime;
import java.util.List;

public interface PrescriptionRepository extends JpaRepository<Prescription, Long> {
    List<Prescription> findByPatientId(Long patientId);
    List<Prescription> findByDoctorId(Long doctorId);
    List<Prescription> findByStatus(String status);
    List<Prescription> findByPrescribedDateBetween(LocalDateTime start, LocalDateTime end);
    List<Prescription> findByPatientIdAndStatus(Long patientId, String status);
}
