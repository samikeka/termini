package com.samikeka.project.Termini.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(
        name = "company_memberships",
        uniqueConstraints = @UniqueConstraint(name = "uk_company_user", columnNames = {"company_id", "user_id"})
)
@Getter
@Setter
public class CompanyMembership {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "company_id", nullable = false)
    private Company company;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    @JsonIgnoreProperties({"fields", "passwordHash"})
    private User user;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private CompanyMembershipRole role = CompanyMembershipRole.EMPLOYEE;
}
