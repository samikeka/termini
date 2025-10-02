package com.samikeka.project.Termini.entity;


import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.GenericGenerator;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.UUID;

//this is an entity appointment
@Entity
@Getter
@Setter
public class Appointment {
    @Id
    @GeneratedValue(generator = "UUID")
    @GenericGenerator(
            name = "UUID",
            strategy = "org.hibernate.id.UUIDGenerator"
    )
    private UUID appointmentId;
    @ManyToOne
    @JsonBackReference
    private Field fieldLocation;
    private LocalDate dateAppointment;
    private LocalTime timeAppointment;
    @Column(nullable = false, columnDefinition = "TINYINT DEFAULT 1")
    private  Byte timeReservedField=1;

}
