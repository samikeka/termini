package com.samikeka.project.Termini.controller;

import com.samikeka.project.Termini.entity.Appointment;
import com.samikeka.project.Termini.service.IAppointmentService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.List;

@RestController
@RequestMapping("api/v1/appointments")
public class AppointmentController {
    private final IAppointmentService appointmentService;

    public AppointmentController(IAppointmentService appointmentService) {
        this.appointmentService = appointmentService;
    }

    //merr listen e krejt termineve qe jane online
    @GetMapping
    public ResponseEntity<List<Appointment>> allAppointments() {
        return ResponseEntity.ok(appointmentService.getAllAppointment());
    }

    //reservation of an Appointment from end-user
    @PostMapping
    public ResponseEntity<Appointment> createAppointment(@RequestBody Appointment appointment) {
        Appointment savedAppointment = appointmentService.createAppointment(appointment);
        URI uri = URI.create("/appointment/" + savedAppointment.getAppointmentId());
        return ResponseEntity.created(uri).body(savedAppointment);
    }
}
