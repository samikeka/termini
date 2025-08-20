package com.samikeka.project.Termini.repository;

import com.samikeka.project.Termini.entity.Appointment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalTime;
import java.util.UUID;

public interface AppointmentRepository extends JpaRepository<Appointment, UUID> {
   Appointment findByTimeAppointment(LocalTime time);

}
