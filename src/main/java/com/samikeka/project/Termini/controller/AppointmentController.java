package com.samikeka.project.Termini.controller;

import com.samikeka.project.Termini.dto.CreateBookingRequest;
import com.samikeka.project.Termini.entity.Appointment;
import com.samikeka.project.Termini.security.SecurityUtils;
import com.samikeka.project.Termini.service.IAppointmentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.List;

@RestController
@RequestMapping("/api/appointments")
@Tag(name = "Appointments", description = "Menaxhimi i termimeve për fushat sportive")
public class AppointmentController {
    private final IAppointmentService appointmentService;

    public AppointmentController(IAppointmentService appointmentService) {
        this.appointmentService = appointmentService;
    }

    //merr listen e krejt termineve qe jane online

    @Operation(summary = "Terminet e mia për një shërbim/fushë (vetëm përdoruesi i kyçur)")
    @GetMapping("/field/{fieldId}")
    public ResponseEntity<List<Appointment>> appointmentsByField(@PathVariable Long fieldId) {
        long userId = SecurityUtils.requireUserId();
        return ResponseEntity.ok(appointmentService.getMyAppointmentsForField(fieldId, userId));
    }

    //reservation of an Appointment from end-user
    @Operation(
            summary = "Krijon një termim të ri",
            description = "Krijon një termim të ri për një përdorues dhe një fushë të caktuar",
            responses = {
                    @ApiResponse(responseCode = "201", description = "Termimi u krijua me sukses"),
                    @ApiResponse(responseCode = "400", description = "Të dhëna të pavlefshme")
            }
    )
    @PostMapping
    public ResponseEntity<Appointment> createAppointment(@Valid @RequestBody CreateBookingRequest request) {
        Appointment savedAppointment = appointmentService.createBooking(request);
        URI uri = URI.create("/appointment/" + savedAppointment.getAppointmentId());
        return ResponseEntity.created(uri).body(savedAppointment);
    }
}
