package com.samikeka.project.Termini.repository;

import com.samikeka.project.Termini.entity.Appointment;
import com.samikeka.project.Termini.entity.Payment;
import com.samikeka.project.Termini.entity.PaymentStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface PaymentRepository extends JpaRepository<Payment, Long> {

    Optional<Payment> findFirstByAppointmentAndStatus(Appointment appointment, PaymentStatus status);

    Optional<Payment> findByIdAndPayer_Id(Long id, Long payerId);

    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query("DELETE FROM Payment p WHERE p.appointment.appointmentId = :aid")
    void deleteForAppointmentId(@Param("aid") Long appointmentId);
}
