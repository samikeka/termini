package com.samikeka.project.Termini.entity;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * Joining player for Player Completion (TASK 2 “Participant” aggregate).
 */
@Entity
@Table(
        name = "match_participants",
        uniqueConstraints = @UniqueConstraint(name = "uk_match_participant_appointment_user", columnNames = {"appointment_id", "user_id"})
)
@Getter
@Setter
public class MatchParticipant {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "appointment_id", nullable = false)
    @JsonBackReference
    private Appointment appointment;

    @ManyToOne(optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    @JsonIgnoreProperties({"fields"})
    private User player;

    @Column(precision = 10, scale = 2)
    private BigDecimal shareAmount;

    private LocalDateTime joinedAt;
}
