package com.samikeka.project.Termini.dto;

import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;

@Getter
@Setter
public class AppointmentDto {
    private Long appointmentId;
    private Long fieldId;
    private String fieldName;
    private Long bookerUserId;
    private String bookerName;
    private String bookerEmail;
    private String guestName;
    private String guestEmail;
    private LocalDate dateAppointment;
    private LocalTime timeAppointment;
    private Byte timeReservedField = 1;
    /** Kohëzgjatja e rezervimit në minuta (kur aplikohet). */
    private Integer durationMinutes;
    private Long organizerUserId;
    private boolean seekingPlayers;
    private Integer playersNeeded;
    private BigDecimal totalFieldPrice;
    private boolean splitPaymentEnabled;
    private Integer splitAmongPlayerCount;
}
