package com.samikeka.project.Termini.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Entity
@Getter
@Setter
@Table(name="app_user")
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String name;
    private String city;
    @Column(unique = true)
    private String email;

    @JsonIgnore
    @Column(name = "password_hash")
    private String passwordHash;

    @Column(nullable = false)
    private int goals = 0;

    @Column(nullable = false)
    private int assists = 0;

    @Column(nullable = false)
    private int mvpCount = 0;

    @Enumerated(EnumType.STRING)
    @Column(length = 20)
    private UserRole role = UserRole.USER;

    @Column(name = "owner_iban", length = 34)
    private String ownerIban;

    @Column(name = "owner_account_holder", length = 255)
    private String ownerAccountHolder;

    @OneToMany(mappedBy = "fieldOwner")
    @JsonManagedReference
    private List<Field> fields;

}
