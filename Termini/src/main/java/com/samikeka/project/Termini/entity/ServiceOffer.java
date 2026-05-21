package com.samikeka.project.Termini.entity;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
@Entity
@Table(name = "service_offers")
public class ServiceOffer {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "field_id", nullable = false)
    @JsonBackReference
    private Field field;

    @Column(nullable = false, length = 120)
    private String name;

    @Column(name = "duration_minutes", nullable = false)
    private Integer durationMinutes;

    @Column(name = "price_eur", precision = 10, scale = 2, nullable = false)
    private BigDecimal priceEur;

    @Column(name = "tenant_id")
    private Long tenantId;
}

