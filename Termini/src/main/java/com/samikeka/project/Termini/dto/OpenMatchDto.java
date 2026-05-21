package com.samikeka.project.Termini.dto;

import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;

@Getter
@Setter
public class OpenMatchDto {
    private Long appointmentId;

    /** First-class aggregate id for Player Completion network (TASK 6). */
    private Long gameRequestId;
    private Long fieldId;
    private String fieldName;
    private String fieldCity;
    private LocalDate dateAppointment;
    private LocalTime timeAppointment;
    private Byte timeReservedField;
    private int playersNeeded;
    private long joinedCount;
    private long spotsRemaining;
    private BigDecimal splitPerPlayer;
}
