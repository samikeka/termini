package com.samikeka.project.Termini.controller;

import com.samikeka.project.Termini.dto.clubcrm.ClubCrmDto;
import com.samikeka.project.Termini.dto.clubcrm.CreateClubCrmRequest;
import com.samikeka.project.Termini.security.SecurityUtils;
import com.samikeka.project.Termini.service.ClubCrmService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.List;

/**
 * Club Management CRM — separate from public field booking flows.
 */
@RestController
@RequestMapping("/api/v1/club-crm")
@Validated
@RequiredArgsConstructor
@Tag(name = "Club CRM", description = "Sports club workspace (Phase 1: clubs & memberships)")
public class ClubCrmController {

    private final ClubCrmService clubCrmService;

    @Operation(summary = "Create a club workspace; caller becomes owner")
    @PostMapping("/clubs")
    public ResponseEntity<ClubCrmDto> createClub(@RequestBody @Valid CreateClubCrmRequest body) {
        long uid = SecurityUtils.requireUserId();
        ClubCrmDto dto = clubCrmService.createClub(uid, body);
        return ResponseEntity.created(URI.create("/api/v1/club-crm/clubs/" + dto.getId())).body(dto);
    }

    @Operation(summary = "Clubs you own or are an active member of")
    @GetMapping("/clubs/mine")
    public ResponseEntity<List<ClubCrmDto>> myClubs() {
        return ResponseEntity.ok(clubCrmService.listMyClubs(SecurityUtils.requireUserId()));
    }

    @Operation(summary = "Get club if you are owner or member")
    @GetMapping("/clubs/{clubId}")
    public ResponseEntity<ClubCrmDto> getClub(@PathVariable long clubId) {
        return ResponseEntity.ok(clubCrmService.getClub(SecurityUtils.requireUserId(), clubId));
    }
}
