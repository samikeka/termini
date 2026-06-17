package com.samikeka.project.Termini.clubcrm;

import com.samikeka.project.Termini.entity.User;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.Instant;

@Entity
@Table(
        name = "club_crm_members",
        uniqueConstraints = @UniqueConstraint(name = "uk_club_crm_member_club_user", columnNames = {"club_id", "user_id"})
)
@Getter
@Setter
public class ClubMember {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "club_id", nullable = false)
    private Club club;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private ClubMemberRole role = ClubMemberRole.PLAYER;

    @Column(name = "joined_at", nullable = false)
    private Instant joinedAt = Instant.now();

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private ClubMemberStatus status = ClubMemberStatus.ACTIVE;
}
