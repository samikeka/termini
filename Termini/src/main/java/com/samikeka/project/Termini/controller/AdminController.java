package com.samikeka.project.Termini.controller;

import com.samikeka.project.Termini.repository.AppointmentRepository;
import com.samikeka.project.Termini.repository.CompanyRepository;
import com.samikeka.project.Termini.repository.FieldRepository;
import com.samikeka.project.Termini.repository.GameRequestRepository;
import com.samikeka.project.Termini.repository.RecurringBookingRepository;
import com.samikeka.project.Termini.repository.UserRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.LinkedHashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/admin")
@PreAuthorize("hasAuthority('ROLE_ADMIN')")
@RequiredArgsConstructor
@Tag(name = "Admin", description = "Platform operator (TASK 21)")
public class AdminController {

    private final UserRepository userRepository;
    private final FieldRepository fieldRepository;
    private final AppointmentRepository appointmentRepository;
    private final CompanyRepository companyRepository;
    private final GameRequestRepository gameRequestRepository;
    private final RecurringBookingRepository recurringBookingRepository;

    @Operation(summary = "Lightweight health / inventory counts")
    @GetMapping("/summary")
    public ResponseEntity<Map<String, Object>> summary() {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("users", userRepository.count());
        m.put("fields", fieldRepository.count());
        m.put("appointments", appointmentRepository.count());
        m.put("companies", companyRepository.count());
        m.put("gameRequests", gameRequestRepository.count());
        m.put("recurringTemplates", recurringBookingRepository.count());
        return ResponseEntity.ok(m);
    }
}
