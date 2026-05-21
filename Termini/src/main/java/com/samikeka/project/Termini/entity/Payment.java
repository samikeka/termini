package com.samikeka.project.Termini.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.Instant;

@Entity
@Table(name = "payments")
@Getter
@Setter
public class Payment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "appointment_id", nullable = false)
    private Appointment appointment;

    @ManyToOne(optional = true)
    @JoinColumn(name = "payer_id")
    private User payer;

    @Column(name = "guest_payer_email", length = 255)
    private String guestPayerEmail;

    @Column(name = "guest_payer_name", length = 200)
    private String guestPayerName;

    @Column(name = "owner_iban_snapshot", length = 34)
    private String ownerIbanSnapshot;

    @Column(name = "payout_note", length = 500)
    private String payoutNote;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal amount;

    @Column(nullable = false, length = 8)
    private String currency = "EUR";

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private PaymentStatus status = PaymentStatus.PENDING;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private PaymentProvider provider = PaymentProvider.MOCK;

    @Column(name = "external_ref", length = 255)
    private String externalReference;

    @Column(nullable = false)
    private Instant createdAt = Instant.now();

    @Column(name = "tenant_id")
    private Long tenantId;

    /** Optional platform commission (EUR); Stripe Connect placeholder (TASK 12/13). */
    @Column(name = "platform_fee_eur", precision = 10, scale = 2)
    private BigDecimal platformFeeEur;
}
