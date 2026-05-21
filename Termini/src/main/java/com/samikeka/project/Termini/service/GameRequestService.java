package com.samikeka.project.Termini.service;

import com.samikeka.project.Termini.entity.Appointment;
import com.samikeka.project.Termini.entity.GameRequest;
import com.samikeka.project.Termini.entity.GameRequestStatus;
import com.samikeka.project.Termini.repository.GameRequestRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class GameRequestService {

    private final GameRequestRepository gameRequestRepository;

    @Transactional
    public GameRequest upsertOpen(Appointment appointment, Long tenantId) {
        GameRequest gr = gameRequestRepository
                .findByAppointment_AppointmentId(appointment.getAppointmentId())
                .orElse(new GameRequest());
        gr.setAppointment(appointment);
        if (tenantId != null) {
            gr.setTenantId(tenantId);
        }
        Instant now = Instant.now();
        if (gr.getId() == null) {
            gr.setCreatedAt(now);
            gr.setStatus(GameRequestStatus.OPEN);
        } else if (gr.getStatus() != GameRequestStatus.FILLED) {
            gr.setStatus(GameRequestStatus.OPEN);
        }
        gr.setUpdatedAt(now);
        return gameRequestRepository.save(gr);
    }

    @Transactional
    public void markFilled(long appointmentId) {
        gameRequestRepository.findByAppointment_AppointmentId(appointmentId).ifPresent(gr -> {
            gr.setStatus(GameRequestStatus.FILLED);
            gr.setUpdatedAt(Instant.now());
            gameRequestRepository.save(gr);
        });
    }

    @Transactional
    public void deleteForAppointment(long appointmentId) {
        gameRequestRepository.deleteByAppointment_AppointmentId(appointmentId);
    }

    @Transactional(readOnly = true)
    public Optional<Long> findGameRequestIdByAppointmentId(long appointmentId) {
        return gameRequestRepository.findByAppointment_AppointmentId(appointmentId).map(GameRequest::getId);
    }
}
