package com.samikeka.project.Termini.repository;

import com.samikeka.project.Termini.entity.Appointment;
import com.samikeka.project.Termini.entity.MatchParticipant;
import com.samikeka.project.Termini.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface MatchParticipantRepository extends JpaRepository<MatchParticipant, Long> {

    long countByAppointment(Appointment appointment);

    Optional<MatchParticipant> findByAppointmentAndPlayer(Appointment appointment, User player);

    List<MatchParticipant> findByAppointmentOrderByJoinedAtAsc(Appointment appointment);
}
