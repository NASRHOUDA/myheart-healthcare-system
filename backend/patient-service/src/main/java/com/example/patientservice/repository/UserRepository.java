package com.example.patientservice.repository;

import com.example.patientservice.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;
import java.util.List;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    List<User> findByRole(String role);
    Optional<User> findByPatientId(Long patientId);
    boolean existsByEmail(String email);
}
