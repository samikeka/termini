package com.samikeka.project.Termini.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.util.List;
import java.util.UUID;
@Getter
@Setter
@Entity

public class Field {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private UUID id;
    private String name;
    private String location;
    private String city;
    @ManyToOne
    private User fieldOwner;
    @OneToMany(mappedBy = "fieldLocation")
    private List<Appointment> appointments;
}
