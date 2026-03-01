package com.example.patientservice.controller;

import com.example.patientservice.entity.User;
import com.example.patientservice.repository.UserRepository;
import com.example.patientservice.repository.PatientRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:3000")
public class AuthController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PatientRepository patientRepository;

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> credentials) {
        Map<String, Object> response = new HashMap<>();
        try {
            String email = credentials.get("email");
            String password = credentials.get("password");
            String role = credentials.get("role");

            if (email == null || password == null) {
                response.put("error", "Email et mot de passe requis");
                return ResponseEntity.badRequest().body(response);
            }

            Optional<User> userOpt = userRepository.findByEmail(email);
            if (!userOpt.isPresent()) {
                response.put("error", "Email ou mot de passe incorrect");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
            }

            User user = userOpt.get();
            if (!password.equals(user.getPassword())) {
                response.put("error", "Email ou mot de passe incorrect");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
            }

            if (role != null && !user.getRole().equals(role)) {
                response.put("error", "Role incorrect");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
            }

            response.put("id", user.getId());
            response.put("email", user.getEmail());
            response.put("role", user.getRole());
            response.put("firstName", user.getFirstName());
            response.put("lastName", user.getLastName());

            // Pour les patients : ajouter patientId depuis la table patients
            if ("patient".equals(user.getRole())) {
                patientRepository.findByEmail(email).ifPresent(patient -> {
                    response.put("patientId", patient.getId());
                });
            }

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            response.put("error", "Erreur serveur: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody Map<String, String> userData) {
        Map<String, Object> response = new HashMap<>();
        try {
            String email = userData.get("email");
            String password = userData.get("password");
            String role = userData.get("role");

            if (email == null || password == null || role == null) {
                response.put("error", "Email, mot de passe et role requis");
                return ResponseEntity.badRequest().body(response);
            }

            if (userRepository.findByEmail(email).isPresent()) {
                response.put("error", "Email deja utilise");
                return ResponseEntity.status(HttpStatus.CONFLICT).body(response);
            }

            User user = new User();
            user.setEmail(email);
            user.setPassword(password);
            user.setRole(role);
            user.setFirstName(userData.get("firstName"));
            user.setLastName(userData.get("lastName"));
            if ("reception".equals(role) || "lab".equals(role)) {
                user.setEmployeeId(userData.get("employeeId"));
            }

            User saved = userRepository.save(user);
            response.put("id", saved.getId());
            response.put("email", saved.getEmail());
            response.put("role", saved.getRole());
            response.put("firstName", saved.getFirstName());
            response.put("lastName", saved.getLastName());
            return ResponseEntity.status(HttpStatus.CREATED).body(response);

        } catch (Exception e) {
            response.put("error", "Erreur: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    @GetMapping("/users/role/{role}")
    public ResponseEntity<?> getUsersByRole(@PathVariable String role) {
        try {
            List<Map<String, Object>> users = userRepository.findAll()
                .stream()
                .filter(u -> role.equals(u.getRole()))
                .map(u -> {
                    Map<String, Object> m = new HashMap<>();
                    m.put("id", u.getId());
                    m.put("email", u.getEmail());
                    m.put("role", u.getRole());
                    m.put("firstName", u.getFirstName());
                    m.put("lastName", u.getLastName());
                    return m;
                })
                .collect(Collectors.toList());
            return ResponseEntity.ok(users);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", e.getMessage()));
        }
    }
}