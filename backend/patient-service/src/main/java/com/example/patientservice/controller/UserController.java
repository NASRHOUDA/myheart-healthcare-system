package com.example.patientservice.controller;

import com.example.patientservice.entity.User;
import com.example.patientservice.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "http://localhost:3000")
public class UserController {

    @Autowired
    private UserRepository userRepository;

    // Constructeur avec log
    public UserController() {
        System.out.println("========================================");
        System.out.println("✅✅✅ UserController CHARGÉ avec succès ! ✅✅✅");
        System.out.println("========================================");
    }

    @GetMapping("/role/{role}")
    public List<UserDTO> getUsersByRole(@PathVariable String role) {
        return userRepository.findByRole(role).stream()
            .map(this::convertToDTO)
            .collect(Collectors.toList());
    }

    private UserDTO convertToDTO(User user) {
        UserDTO dto = new UserDTO();
        dto.setId(user.getId());
        dto.setEmail(user.getEmail());
        dto.setRole(user.getRole());
        dto.setFirstName(user.getFirstName());
        dto.setLastName(user.getLastName());
        dto.setPhone(user.getPhone());
        dto.setAddress(user.getAddress());
        dto.setPatientId(user.getPatientId());
        return dto;
    }

    // Classe interne DTO
    public static class UserDTO {
        private Long id;
        private String email;
        private String role;
        private String firstName;
        private String lastName;
        private String phone;
        private String address;
        private Long patientId;

        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }

        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }

        public String getRole() { return role; }
        public void setRole(String role) { this.role = role; }

        public String getFirstName() { return firstName; }
        public void setFirstName(String firstName) { this.firstName = firstName; }

        public String getLastName() { return lastName; }
        public void setLastName(String lastName) { this.lastName = lastName; }

        public String getPhone() { return phone; }
        public void setPhone(String phone) { this.phone = phone; }

        public String getAddress() { return address; }
        public void setAddress(String address) { this.address = address; }

        public Long getPatientId() { return patientId; }
        public void setPatientId(Long patientId) { this.patientId = patientId; }
    }
}
