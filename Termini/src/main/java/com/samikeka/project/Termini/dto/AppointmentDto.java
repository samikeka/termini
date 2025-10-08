package com.samikeka.project.Termini.dto;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.UUID;

@Getter
@Setter
public class AppointmentDto {
    private UUID appointmentId;
    private UUID fieldId;  // vetëm ID e fushës, jo gjithë objekti
    private LocalDate dateAppointment;
    private LocalTime timeAppointment;
    private Byte timeReservedField = 1;
}
