package com.samikeka.project.Termini.repository;

import com.samikeka.project.Termini.entity.GameRequest;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface GameRequestRepository extends JpaRepository<GameRequest, Long> {

    Optional<GameRequest> findByAppointment_AppointmentId(Long appointmentId);

    void deleteByAppointment_AppointmentId(Long appointmentId);
}
