package com.samikeka.project.Termini.clubcrm;

import com.samikeka.project.Termini.entity.User;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.Instant;

/**
 * Sports club workspace (Club CRM). Kept separate from field booking aggregates.
 */
@Entity
@Table(name = "club_crm_clubs")
@Getter
@Setter
public class Club {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 180)
    private String name;

    @Column(name = "logo_url", length = 512)
    private String logoUrl;

    /** e.g. FOOTBALL, BASKETBALL — free text for MVP */
    @Column(name = "sport_type", nullable = false, length = 64)
    private String sportType;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "owner_id", nullable = false)
    private User owner;

    @Column(nullable = false, length = 255)
    private String location;

    /** Placeholder for future SaaS tiers: FREE, CLUB_29, CLUB_49, CLUB_99 */
    @Column(name = "subscription_plan", nullable = false, length = 32)
    private String subscriptionPlan = "FREE";

    @Column(name = "created_at", nullable = false)
    private Instant createdAt = Instant.now();
}
