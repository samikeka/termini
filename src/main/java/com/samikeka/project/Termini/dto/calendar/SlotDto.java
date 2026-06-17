package com.samikeka.project.Termini.dto.calendar;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class SlotDto {

    /** Start hour-of-day for the slot segment. */
    private int hour;

    /** Start minute (0–59). Enables 30/15-minute grids while staying backward-compatible. */
    private int minute;

    /**
     * True when slot is blocked for new bookings (reserved or in-session).
     * @deprecated prefer {@link #availability}
     */
    private boolean busy;

    /** FREE / RESERVED / IN_PROGRESS — TASK 3. */
    private SlotAvailability availability;
}
