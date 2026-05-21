package com.samikeka.project.Termini.repository;

import com.samikeka.project.Termini.entity.Appointment;
import com.samikeka.project.Termini.entity.Field;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

public interface AppointmentRepository extends JpaRepository<Appointment, Long> {

    List<Appointment> findByFieldLocationAndDateAppointmentAndTimeAppointment(Field fieldLocation, LocalDate dateAppointment, LocalTime timeAppointment);

    List<Appointment> findByFieldLocationAndDateAppointment(Field field, LocalDate dateAppointment);

    List<Appointment> findByFieldLocationFieldOwnerId(Long ownerId);

    List<Appointment> findByFieldLocation_Id(Long fieldId);

    List<Appointment> findByFieldLocation_IdAndDateAppointmentBetween(Long fieldId, LocalDate start, LocalDate end);

    List<Appointment> findBySeekingPlayersTrue();

    /** Pessimistic write lock for TASK 5 — avoids double-booking under concurrent saves. */
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select a from Appointment a where a.fieldLocation.id = :fieldId and a.dateAppointment = :day order by a.appointmentId")
    List<Appointment> findForFieldAndDayForUpdate(@Param("fieldId") Long fieldId, @Param("day") LocalDate day);
}
