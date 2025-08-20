package com.samikeka.project.Termini.controller;

import com.samikeka.project.Termini.entity.Appointment;
import com.samikeka.project.Termini.service.IAppointmentService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1")
public class AppointmentController {
    private final IAppointmentService appointmentService;

    public AppointmentController(IAppointmentService appointmentService) {
        this.appointmentService = appointmentService;
    }

    //merr listen e krejt termineve qe jane online
    @GetMapping("/appointment")
    public List<Appointment> allAppointments(){
        return appointmentService.getAllAppointment();
    }
    //reservation of an Appointment from end-user
    @PostMapping("/appointment")
    public void createAppointment(@RequestBody Appointment appointment){
        appointmentService.createAppointment(appointment);
    }



}
