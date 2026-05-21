package com.samikeka.project.Termini.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;
import java.time.LocalTime;

/**
 * Template for repeating reservations (weekly / monthly MVP stub — expansion scanned by scheduler).
 */
@Entity
@Table(name = "recurring_bookings")
@Getter
@Setter
public class RecurringBooking {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "field_id", nullable = false)
    private Field field;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "booker_id", nullable = false)
    private User booker;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private RecurrenceFrequency frequency = RecurrenceFrequency.WEEKLY;

    /** ISO-8601 day of week Monday=1 … Sunday=7 */
    @Column(nullable = false)
    private int dayOfWeek = 1;

    @Column(nullable = false)
    private LocalTime startTime = LocalTime.of(20, 0);

    @Column(name = "duration_minutes", nullable = false)
    private int durationMinutes = 60;

    @Column(name = "active_until")
    private LocalDate activeUntil;

    @Column(nullable = false)
    private boolean paused;

    /** Owner / venue tenant for isolation (= field owner's user id). */
    @Column(name = "tenant_id")
    private Long tenantId;

    /** Last generated occurrence (prevents duplicates in expander). */
    @Column(name = "last_materialized_date")
    private LocalDate lastMaterializedDate;
}
