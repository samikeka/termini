package com.samikeka.project.Termini.repository;

import com.samikeka.project.Termini.entity.ServiceOffer;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ServiceOfferRepository extends JpaRepository<ServiceOffer, Long> {
    List<ServiceOffer> findByField_IdOrderByDurationMinutesAsc(Long fieldId);
}

