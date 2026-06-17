package com.samikeka.project.Termini.entity;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.util.List;

@Getter
@Setter
@Entity
@Table(name="fields")
public class Field {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String name;
    private String location;
    private String city;

    /** Foto kryesore (p.sh. fusha publike outdoor — vetëm shfaqje, pa rezervim). */
    @Column(name = "cover_image_url", length = 512)
    private String coverImageUrl;

    @Enumerated(EnumType.STRING)
    @Column(length = 20)
    private CountryRegion country = CountryRegion.KOSOVO;

    @Column(name = "hourly_price_eur", precision = 10, scale = 2)
    private BigDecimal hourlyPriceEur;

    @Enumerated(EnumType.STRING)
    @Column(length = 20)
    private ServiceCategory category = ServiceCategory.SPORTS;

    /**
     * Për shërbime që nuk janë “€/orë”, kjo ndihmon UI të propozojë kohëzgjatjen default.
     * Për fusha sportive: 60 min (1 orë).
     */
    @Column(name = "default_duration_minutes")
    private Integer defaultDurationMinutes = 60;

    /**
     * Tenant isolation key: always the owning field manager's {@link User#getId()} (TASK 1).
     */
    @Column(name = "tenant_id")
    private Long tenantId;

    /** Calendar grid step in minutes (e.g. 30 or 60) for TASK 3 slot granularity. */
    @Column(name = "slot_calendar_minutes")
    private Integer slotCalendarMinutes = 60;

    @ManyToOne
    @JsonBackReference
    @JoinColumn(name = "field_owner_id")
    private User fieldOwner;
    @OneToMany(mappedBy = "fieldLocation")
    @JsonManagedReference
    private List<Appointment> appointments;

    @OneToMany(mappedBy = "field", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ServiceOffer> offers;
}
