package com.samikeka.project.Termini.entity;


import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.UUID;

//this is an entity appointment
@Entity
@Getter
@Setter
public class Appointment {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID appointmentId;
    @ManyToOne
    private Field fieldLocation;
    private LocalDate dateAppointment;
    private LocalTime timeAppointment;

}
