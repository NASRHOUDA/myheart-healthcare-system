package com.example.billingservice.controller;

import com.example.billingservice.entity.Bill;
import com.example.billingservice.repository.BillRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/bills")
@CrossOrigin(origins = "*")
public class BillController {

    @Autowired
    private BillRepository billRepository;

    @GetMapping
    public List<Bill> getAllBills() {
        return billRepository.findAll();
    }

    @GetMapping("/{id}")
    public Bill getBillById(@PathVariable Long id) {
        return billRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Bill not found"));
    }

    @GetMapping("/patient/{patientId}")
    public List<Bill> getBillsByPatient(@PathVariable Long patientId) {
        return billRepository.findByPatientId(patientId);
    }

    @GetMapping("/appointment/{appointmentId}")
    public Bill getBillByAppointment(@PathVariable Long appointmentId) {
        List<Bill> bills = billRepository.findByAppointmentId(appointmentId);
        if (bills.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Bill not found");
        }
        return bills.get(0);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Bill createBill(@RequestBody Bill bill) {
        return billRepository.save(bill);
    }

    @PostMapping("/generate/{appointmentId}")
    @ResponseStatus(HttpStatus.CREATED)
    public Bill generateBillForAppointment(@PathVariable Long appointmentId) {
        Bill bill = new Bill();
        bill.setAppointmentId(appointmentId);
        bill.setAmount(new BigDecimal("100.00"));
        bill.setDescription("Consultation médicale");
        return billRepository.save(bill);
    }

    @PutMapping("/{id}/pay")
    public Bill payBill(@PathVariable Long id, @RequestParam String paymentMethod) {
        Bill bill = getBillById(id);
        bill.setStatus("PAID");
        bill.setPaidDate(LocalDateTime.now());
        bill.setPaymentMethod(paymentMethod);
        return billRepository.save(bill);
    }
}
