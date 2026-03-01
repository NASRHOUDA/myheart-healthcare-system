package com.example.pharmacyservice.service;

import com.example.pharmacyservice.entity.Medication;
import com.example.pharmacyservice.repository.MedicationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.math.BigDecimal;
import java.util.List;

@Service
public class MedicationService {

    @Autowired
    private MedicationRepository medicationRepository;

    public List<Medication> getAllMedications() {
        return medicationRepository.findAll();
    }

    public Medication getMedicationById(Long id) {
        return medicationRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Médicament non trouvé avec l'id: " + id));
    }

    public Medication createMedication(Medication medication) {
        // Validation
        if (medication.getName() == null || medication.getName().trim().isEmpty()) {
            throw new RuntimeException("Le nom du médicament est obligatoire");
        }
        if (medication.getStrength() == null || medication.getStrength().trim().isEmpty()) {
            throw new RuntimeException("Le dosage est obligatoire");
        }
        
        // Set default values
        if (medication.getStockQuantity() == null) {
            medication.setStockQuantity(0);
        }
        if (medication.getRequiresPrescription() == null) {
            medication.setRequiresPrescription(false);
        }
        
        return medicationRepository.save(medication);
    }

    public Medication updateMedication(Long id, Medication medicationDetails) {
        Medication existingMedication = getMedicationById(id);
        
        // Mise à jour des champs
        existingMedication.setName(medicationDetails.getName());
        existingMedication.setGenericName(medicationDetails.getGenericName());
        existingMedication.setDescription(medicationDetails.getDescription());
        existingMedication.setStrength(medicationDetails.getStrength());
        existingMedication.setDosageForm(medicationDetails.getDosageForm());
        existingMedication.setManufacturer(medicationDetails.getManufacturer());
        existingMedication.setCategory(medicationDetails.getCategory());
        existingMedication.setCode(medicationDetails.getCode());
        existingMedication.setStockQuantity(medicationDetails.getStockQuantity());
        existingMedication.setPrice(medicationDetails.getPrice());
        existingMedication.setRequiresPrescription(medicationDetails.getRequiresPrescription());
        existingMedication.setUnit(medicationDetails.getUnit());
        
        return medicationRepository.save(existingMedication);
    }

    public void deleteMedication(Long id) {
        Medication medication = getMedicationById(id);
        medicationRepository.delete(medication);
    }

    public List<Medication> getLowStockMedications(int threshold) {
        return medicationRepository.findByStockQuantityLessThan(threshold);
    }
}
