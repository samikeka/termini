package com.samikeka.project.Termini.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;
import java.time.LocalTime;

@Getter
@Setter
public class CreateBookingRequest {

    @NotNull
    private Long fieldId;

    @NotNull
    private LocalDate dateAppointment;

    @NotNull
    private LocalTime timeAppointment;

    /**
     * Kohëzgjatja e rezervimit në minuta (p.sh. 30/45/60/90/120).
     * Nëse mungon, serveri përdor timeReservedField * 60 ose default (60).
     */
    @Min(15)
    @Max(12 * 60)
    private Integer durationMinutes;

    @Min(1)
    @Max(12)
    private Integer timeReservedField = 1;

    /** Required when the request is anonymous (no JWT). */
    private String guestName;

    private String guestEmail;

    /**
     * Player-completion shortcut: activate public join slots immediately after booking (TASK 6).
     * Requires an authenticated booker — cannot be combined with anonymous guest bookings.
     */
    @Min(1)
    @Max(64)
    private Integer openJoinSlots;
}
