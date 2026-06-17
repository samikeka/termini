package com.samikeka.project.Termini.controller;

import com.samikeka.project.Termini.dto.CreateRecurringBookingRequest;
import com.samikeka.project.Termini.entity.RecurringBooking;
import com.samikeka.project.Termini.security.SecurityUtils;
import com.samikeka.project.Termini.service.RecurringBookingService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.List;

@RestController
@RequestMapping("/api/v1/recurring-bookings")
@Validated
@RequiredArgsConstructor
@Tag(name = "Recurring", description = "Recurring booking templates (TASK 14)")
public class RecurringBookingController {

    private final RecurringBookingService recurringBookingService;

    @Operation(summary = "Create a recurring template for the logged-in user")
    @PostMapping
    public ResponseEntity<RecurringBooking> create(@RequestBody @Valid CreateRecurringBookingRequest body) {
        RecurringBooking saved = recurringBookingService.createTemplate(SecurityUtils.requireUserId(), body);
        return ResponseEntity.created(URI.create("/api/v1/recurring-bookings/" + saved.getId())).body(saved);
    }

    @Operation(summary = "Templates owned by the logged-in booker")
    @GetMapping("/mine")
    public ResponseEntity<List<RecurringBooking>> mine() {
        return ResponseEntity.ok(recurringBookingService.listMine(SecurityUtils.requireUserId()));
    }
}
