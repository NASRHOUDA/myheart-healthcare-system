package com.example.appointmentservice.controller;

import com.example.appointmentservice.entity.Appointment;
import com.example.appointmentservice.repository.AppointmentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequestMapping("/api/appointments")
public class AppointmentController {

    @Autowired
    private AppointmentRepository appointmentRepository;

    // GET - Tous les rendez-vous
    @GetMapping
    public List<Appointment> getAllAppointments() {
        return appointmentRepository.findAll();
    }

    // GET - Rendez-vous par ID
    @GetMapping("/{id}")
    public Appointment getAppointmentById(@PathVariable Long id) {
        return appointmentRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Rendez-vous non trouvé"));
    }

    // GET - Rendez-vous d'un patient
    @GetMapping("/patient/{patientId}")
    public List<Appointment> getAppointmentsByPatient(@PathVariable Long patientId) {
        return appointmentRepository.findByPatientId(patientId);
    }

    // GET - Rendez-vous d'un docteur
    @GetMapping("/doctor/{doctorId}")
    public List<Appointment> getAppointmentsByDoctor(@PathVariable Long doctorId) {
        return appointmentRepository.findByDoctorId(doctorId);
    }

    // POST - Créer un rendez-vous
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Appointment createAppointment(@RequestBody Appointment appointment) {
        if (appointment.getStatus() == null) {
            appointment.setStatus("SCHEDULED");
        }
        return appointmentRepository.save(appointment);
    }

    // PUT - Modifier un rendez-vous
    @PutMapping("/{id}")
    public ResponseEntity<Appointment> updateAppointment(@PathVariable Long id, @RequestBody Appointment appointmentDetails) {
        return appointmentRepository.findById(id)
                .map(appointment -> {
                    appointment.setDoctorId(appointmentDetails.getDoctorId());
                    appointment.setAppointmentDateTime(appointmentDetails.getAppointmentDateTime());
                    appointment.setReason(appointmentDetails.getReason());
                    appointment.setNotes(appointmentDetails.getNotes());
                    appointment.setStatus(appointmentDetails.getStatus());
                    appointmentRepository.save(appointment);
                    return ResponseEntity.ok(appointment);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    // PUT - Annuler un rendez-vous
    @PutMapping("/{id}/cancel")
    public ResponseEntity<Appointment> cancelAppointment(@PathVariable Long id) {
        return appointmentRepository.findById(id)
                .map(appointment -> {
                    appointment.setStatus("CANCELLED");
                    appointmentRepository.save(appointment);
                    return ResponseEntity.ok(appointment);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    // PUT - Terminer un rendez-vous
    @PutMapping("/{id}/complete")
    public ResponseEntity<Appointment> completeAppointment(@PathVariable Long id) {
        return appointmentRepository.findById(id)
                .map(appointment -> {
                    appointment.setStatus("COMPLETED");
                    appointmentRepository.save(appointment);
                    return ResponseEntity.ok(appointment);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    // PUT - Confirmer un rendez-vous
    @PutMapping("/{id}/confirm")
    public ResponseEntity<Appointment> confirmAppointment(@PathVariable Long id) {
        return appointmentRepository.findById(id)
                .map(appointment -> {
                    appointment.setStatus("CONFIRMED");
                    appointmentRepository.save(appointment);
                    return ResponseEntity.ok(appointment);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    // DELETE - Supprimer un rendez-vous
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteAppointment(@PathVariable Long id) {
        return appointmentRepository.findById(id)
                .map(appointment -> {
                    appointmentRepository.delete(appointment);
                    return ResponseEntity.noContent().<Void>build();
                })
                .orElse(ResponseEntity.notFound().build());
    }
}
