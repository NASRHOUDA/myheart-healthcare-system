package com.example.pharmacyservice.repository;

import com.example.pharmacyservice.entity.Medication;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface MedicationRepository extends JpaRepository<Medication, Long> {
    List<Medication> findByStockQuantityLessThan(int threshold);
}
