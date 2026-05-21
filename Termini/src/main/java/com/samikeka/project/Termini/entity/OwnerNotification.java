package com.samikeka.project.Termini.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.Instant;

@Entity
@Table(name = "owner_notifications")
@Getter
@Setter
public class OwnerNotification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "recipient_id", nullable = false)
    private User recipient;

    @ManyToOne
    @JoinColumn(name = "appointment_id")
    private Appointment appointment;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 32)
    private OwnerNotificationType type = OwnerNotificationType.NEW_BOOKING;

    @Column(nullable = false, length = 600)
    private String message;

    @Column(nullable = false)
    private boolean readFlag = false;

    @Column(nullable = false)
    private Instant createdAt = Instant.now();
}
