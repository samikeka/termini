package com.samikeka.project.Termini.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.Instant;

@Entity
@Table(name = "game_requests")
@Getter
@Setter
public class GameRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "appointment_id", nullable = false, unique = true)
    private Appointment appointment;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private GameRequestStatus status = GameRequestStatus.OPEN;

    @Column(name = "tenant_id")
    private Long tenantId;

    @Column(nullable = false)
    private Instant createdAt = Instant.now();

    @Column(nullable = false)
    private Instant updatedAt = Instant.now();
}
