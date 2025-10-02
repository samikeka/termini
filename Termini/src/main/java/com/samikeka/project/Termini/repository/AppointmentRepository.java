package com.samikeka.project.Termini.repository;

import com.samikeka.project.Termini.entity.Appointment;
import com.samikeka.project.Termini.entity.Field;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.UUID;

public interface AppointmentRepository extends JpaRepository<Appointment, UUID> {


    List<Appointment> findByFieldLocationAndDateAppointmentAndTimeAppointment(Field fieldLocation, LocalDate dateAppointment, LocalTime timeAppointment);
}
