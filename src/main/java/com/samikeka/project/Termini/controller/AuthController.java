package com.samikeka.project.Termini.controller;

import com.samikeka.project.Termini.dto.AuthResponse;
import com.samikeka.project.Termini.dto.LoginRequest;
import com.samikeka.project.Termini.dto.RegisterOwnerRequest;
import com.samikeka.project.Termini.dto.RegisterRequest;
import com.samikeka.project.Termini.service.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
@Tag(name = "Auth", description = "Regjistrim dhe hyrje (JWT)")
public class AuthController {

    private final AuthService authService;

    @Operation(summary = "Regjistrohu si përdorues (lojtar / klient)")
    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {
        AuthResponse body = authService.register(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(body);
    }

    @Operation(summary = "Hyr me email dhe fjalëkalim")
    @PostMapping("/login")
    public AuthResponse login(@Valid @RequestBody LoginRequest request) {
        return authService.login(request);
    }

    @Operation(summary = "Regjistrohu si pronar fushe (JWT me ROLE_FIELD_OWNER + IBAN)")
    @PostMapping("/owner/register")
    public ResponseEntity<AuthResponse> registerOwner(@Valid @RequestBody RegisterOwnerRequest request) {
        AuthResponse body = authService.registerOwner(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(body);
    }
}
