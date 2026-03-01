package com.example.pharmacyservice.controller;

import com.example.pharmacyservice.entity.Medication;
import com.example.pharmacyservice.service.MedicationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/medications")
@CrossOrigin(origins = "http://localhost:3000")
public class MedicationController {

    @Autowired
    private MedicationService medicationService;

    @GetMapping
    public ResponseEntity<List<Medication>> getAllMedications() {
        try {
            List<Medication> medications = medicationService.getAllMedications();
            return ResponseEntity.ok(medications);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<Medication> getMedicationById(@PathVariable Long id) {
        try {
            Medication medication = medicationService.getMedicationById(id);
            return ResponseEntity.ok(medication);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping
    public ResponseEntity<Medication> createMedication(@RequestBody Medication medication) {
        try {
            Medication createdMedication = medicationService.createMedication(medication);
            return ResponseEntity.status(HttpStatus.CREATED).body(createdMedication);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(null);
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<Medication> updateMedication(@PathVariable Long id, @RequestBody Medication medication) {
        try {
            Medication updatedMedication = medicationService.updateMedication(id, medication);
            return ResponseEntity.ok(updatedMedication);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteMedication(@PathVariable Long id) {
        try {
            medicationService.deleteMedication(id);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/low-stock")
    public ResponseEntity<List<Medication>> getLowStockMedications(@RequestParam(defaultValue = "10") int threshold) {
        try {
            List<Medication> medications = medicationService.getLowStockMedications(threshold);
            return ResponseEntity.ok(medications);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}
