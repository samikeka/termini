package com.samikeka.project.Termini.controller;

import com.samikeka.project.Termini.dto.CompanyDto;
import com.samikeka.project.Termini.dto.CreateCompanyRequest;
import com.samikeka.project.Termini.security.SecurityUtils;
import com.samikeka.project.Termini.service.CompanyService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.net.URI;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/companies")
@Validated
@RequiredArgsConstructor
@Tag(name = "Companies", description = "B2B scaffolding (TASK 16–17)")
public class CompanyApiController {

    private final CompanyService companyService;

    @Operation(summary = "Register a company; caller becomes admin")
    @PostMapping
    public ResponseEntity<CompanyDto> create(@RequestBody @Valid CreateCompanyRequest body) {
        CompanyDto dto = companyService.createCompany(SecurityUtils.requireUserId(), body);
        return ResponseEntity.created(URI.create("/api/v1/companies/" + dto.getId())).body(dto);
    }

    @Operation(summary = "Companies you belong to")
    @GetMapping("/mine")
    public ResponseEntity<List<CompanyDto>> mine() {
        return ResponseEntity.ok(companyService.listMine(SecurityUtils.requireUserId()));
    }

    @Operation(summary = "Invite an existing user by email (minimal MVP)")
    @PostMapping("/{companyId}/members")
    public ResponseEntity<Void> invite(
            @PathVariable long companyId,
            @RequestBody Map<String, String> body) {
        String email = body != null ? body.get("email") : null;
        if (email == null || email.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "email required");
        }
        companyService.addMemberByEmail(SecurityUtils.requireUserId(), companyId, email);
        return ResponseEntity.noContent().build();
    }

    @Operation(summary = "Bulk weekly reservation — not implemented (placeholder)")
    @PostMapping("/{companyId}/bulk-bookings")
    public ResponseEntity<Map<String, String>> bulkBookings(@PathVariable long companyId) {
        return ResponseEntity.status(HttpStatus.NOT_IMPLEMENTED)
                .body(Map.of(
                        "message",
                        "Bulk B2B booking batching is scheduled for a follow-up slice — use owner tools or repeat POST /api/appointments for now.",
                        "companyId",
                        String.valueOf(companyId)));
    }
}
