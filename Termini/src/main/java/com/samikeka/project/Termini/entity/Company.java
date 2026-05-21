package com.samikeka.project.Termini.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.Instant;

@Entity
@Table(name = "companies")
@Getter
@Setter
public class Company {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 180)
    private String name;

    /** Primary billing / org admin — maps to {@link User#id}; also used as B2B tenant key. */
    @Column(name = "admin_user_id", nullable = false)
    private Long adminUserId;

    @Column(nullable = false)
    private Instant createdAt = Instant.now();
}
