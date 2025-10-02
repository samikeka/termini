package com.samikeka.project.Termini.entity;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.GenericGenerator;

import java.util.List;
import java.util.UUID;
@Getter
@Setter
@Entity
@Table(name="fields")
public class Field {
    @Id
    @GeneratedValue(generator = "UUID")
    @GenericGenerator(
            name = "UUID",
            strategy = "org.hibernate.id.UUIDGenerator"
    )
    private UUID id;
    private String name;
    private String location;
    private String city;
    @ManyToOne
    @JsonBackReference
    private User fieldOwner;
    @OneToMany(mappedBy = "fieldLocation")
    @JsonManagedReference
    private List<Appointment> appointments;
}
