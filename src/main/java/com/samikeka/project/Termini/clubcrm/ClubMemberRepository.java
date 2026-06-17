package com.samikeka.project.Termini.clubcrm;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface ClubMemberRepository extends JpaRepository<ClubMember, Long> {

    List<ClubMember> findByUser_IdAndStatus(Long userId, ClubMemberStatus status);

    Optional<ClubMember> findByClub_IdAndUser_Id(Long clubId, Long userId);

    @Query("select m.club.id from ClubMember m where m.user.id = :userId and m.status = :status")
    List<Long> findClubIdsByUserIdAndStatus(@Param("userId") Long userId, @Param("status") ClubMemberStatus status);
}
