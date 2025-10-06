package com.samikeka.project.Termini.service.Implementation;

import com.samikeka.project.Termini.entity.Appointment;
import com.samikeka.project.Termini.entity.Field;
import com.samikeka.project.Termini.repository.AppointmentRepository;
import com.samikeka.project.Termini.repository.FieldRepository;
import com.samikeka.project.Termini.service.IAppointmentService;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;


@Service
public class AppointmentService implements IAppointmentService {

    private final AppointmentRepository appointmentRepository;
    private final FieldRepository fieldRepository;

    public AppointmentService(AppointmentRepository appointmentRepository, FieldRepository fieldRepository) {
        this.appointmentRepository = appointmentRepository;
        this.fieldRepository = fieldRepository;
    }

    @Override
    public Appointment createAppointment(Appointment appointment) {
        // VALIDIM
        if (appointment.getFieldLocation() == null || appointment.getFieldLocation().getId() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "fieldLocation.id required");
        }
        if (appointment.getDateAppointment() == null || appointment.getTimeAppointment() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "date/time required");
        }

        UUID fieldId = appointment.getFieldLocation().getId();

        // NGARKO field nga DB (për të shmangur transient objects)
        Field field = fieldRepository.findById(fieldId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Field not found: " + fieldId));
        appointment.setFieldLocation(field);

        // DEFAULT reserved hours
        int reservedHours = appointment.getTimeReservedField() == null ? 1 : appointment.getTimeReservedField().intValue();

        LocalTime newStart = appointment.getTimeAppointment();
        LocalTime newEnd = newStart.plusHours(reservedHours);

        // MERR EXISTING per kete field + date
        List<Appointment> existing = appointmentRepository.findByFieldLocationAndDateAppointment(field, appointment.getDateAppointment());

        // DEBUG (shkruaj vlerat në log për të parë pse nuk kapet)
//        log.debug("Checking overlap for fieldId={} date={} newStart={} newEnd={} existingCount={}",
//                fieldId, appointment.getDateAppointment(), newStart, newEnd, existing.size());

        for (Appointment ex : existing) {
            int exHours = ex.getTimeReservedField() == null ? 1 : ex.getTimeReservedField().intValue();
            LocalTime exStart = ex.getTimeAppointment();
            LocalTime exEnd = exStart.plusHours(exHours);

//            log.debug("Existing appointment {}: {} - {}", ex.getAppointmentId(), exStart, exEnd);

            boolean overlap = newStart.isBefore(exEnd) && newEnd.isAfter(exStart);
            if (overlap) {
                throw new ResponseStatusException(HttpStatus.CONFLICT,
                        String.format("Conflict with appointment %s [%s-%s]", ex.getAppointmentId(), exStart, exEnd));
            }
        }

        // Nese nuk ka conflict -> save
        return appointmentRepository.save(appointment);
    }

    @Override
    public List<Appointment> getAllAppointment() {
        return appointmentRepository.findAll();
    }
}
