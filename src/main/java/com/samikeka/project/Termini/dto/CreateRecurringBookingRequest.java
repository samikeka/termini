package com.samikeka.project.Termini.dto;

import com.samikeka.project.Termini.entity.RecurrenceFrequency;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;
import java.time.LocalTime;

@Getter
@Setter
public class CreateRecurringBookingRequest {

    @NotNull
    private Long fieldId;

    @NotNull
    private RecurrenceFrequency frequency;

    /** ISO Monday=1 … Sunday=7 */
    @Min(1)
    @Max(7)
    private int dayOfWeek = 1;

    @NotNull
    private LocalTime startTime;

    @Min(15)
    @Max(12 * 60)
    private int durationMinutes = 60;

    private LocalDate activeUntil;
}
