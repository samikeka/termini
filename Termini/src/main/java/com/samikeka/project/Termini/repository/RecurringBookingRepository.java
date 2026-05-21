package com.samikeka.project.Termini.repository;

import com.samikeka.project.Termini.entity.RecurringBooking;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;

public interface RecurringBookingRepository extends JpaRepository<RecurringBooking, Long> {

    @Query("select r from RecurringBooking r where r.paused = false "
            + "and (r.activeUntil is null or r.activeUntil >= :today)")
    List<RecurringBooking> findActiveTemplates(@Param("today") LocalDate today);
}
