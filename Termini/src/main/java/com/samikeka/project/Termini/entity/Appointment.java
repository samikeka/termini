package com.samikeka.project.Termini.entity;


import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

//this is an entity appointment
@Entity
@Table(name = "appointment")
@Getter
@Setter
public class Appointment {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long appointmentId;

    /** Optimistic lock for concurrent booking attempts (TASK 5). */
    @Version
    private Long version;
    @ManyToOne
    @JsonBackReference
    private Field fieldLocation;

    @Column(name = "tenant_id")
    private Long tenantId;
    private LocalDate dateAppointment;
    private LocalTime timeAppointment;
    /** Legacy “hours booked” shorthand; Hibernate maps Byte → smallint on PostgreSQL. Avoid MySQL-only TINYINT in columnDefinition. */
    @Column(nullable = false)
    private Byte timeReservedField = 1;

    /**
     * Kohëzgjatja e rezervimit në minuta. Për shërbime si BEAUTY/HEALTH/AUTO zakonisht është 30/45/60.
     * Nëse është null, aplikacioni përdor timeReservedField * 60.
     */
    @Column(name = "duration_minutes")
    private Integer durationMinutes;

    @ManyToOne
    @JoinColumn(name = "booker_id")
    @JsonIgnoreProperties({"fields"})
    private User booker;

    @Column(length = 200)
    private String guestName;

    @Column(length = 255)
    private String guestEmail;

    @ManyToOne
    @JoinColumn(name = "organizer_id")
    @JsonIgnoreProperties({"fields"})
    private User organizer;

    @Column(nullable = false)
    private boolean seekingPlayers = false;

    private Integer playersNeeded;

    @Column(precision = 10, scale = 2)
    private BigDecimal totalFieldPrice;

    @Column(nullable = false)
    private boolean splitPaymentEnabled = false;

    /** Numri total i lojtarëve që ndajnë faturën (p.sh. 10 për 60€ → 6€ secili). */
    private Integer splitAmongPlayerCount;

    @OneToMany(mappedBy = "appointment", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonManagedReference
    private List<MatchParticipant> matchParticipants;
}
