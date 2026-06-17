package com.samikeka.project.Termini.clubcrm;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ClubRepository extends JpaRepository<Club, Long> {

    List<Club> findByOwner_Id(Long ownerId);
}
