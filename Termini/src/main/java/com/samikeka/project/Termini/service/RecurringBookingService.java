package com.samikeka.project.Termini.service;

import com.samikeka.project.Termini.dto.CreateBookingRequest;
import com.samikeka.project.Termini.dto.CreateRecurringBookingRequest;
import com.samikeka.project.Termini.entity.Field;
import com.samikeka.project.Termini.entity.RecurrenceFrequency;
import com.samikeka.project.Termini.entity.RecurringBooking;
import com.samikeka.project.Termini.entity.User;
import com.samikeka.project.Termini.repository.FieldRepository;
import com.samikeka.project.Termini.repository.RecurringBookingRepository;
import com.samikeka.project.Termini.repository.UserRepository;
import com.samikeka.project.Termini.service.IAppointmentService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;

/**
 * TASK 14/15 — expands recurring templates into concrete bookings with conflict skip + log.
 * Uses the same overlap rules as {@link IAppointmentService#createBooking}.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class RecurringBookingService {

    private final RecurringBookingRepository recurringBookingRepository;
    private final FieldRepository fieldRepository;
    private final UserRepository userRepository;
    private final IAppointmentService appointmentService;

    @Transactional
    public RecurringBooking createTemplate(long bookerUserId, CreateRecurringBookingRequest req) {
        Field field = fieldRepository.findById(req.getFieldId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Field not found"));
        User booker = userRepository.findById(bookerUserId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "User not found"));
        if (field.getFieldOwner() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Field has no owner");
        }
        Long tenantId = field.getFieldOwner().getId();
        RecurringBooking r = new RecurringBooking();
        r.setField(field);
        r.setBooker(booker);
        r.setFrequency(req.getFrequency());
        r.setDayOfWeek(req.getDayOfWeek());
        r.setStartTime(req.getStartTime());
        r.setDurationMinutes(req.getDurationMinutes());
        r.setActiveUntil(req.getActiveUntil());
        r.setPaused(false);
        r.setTenantId(tenantId);
        return recurringBookingRepository.save(r);
    }

    @Transactional(readOnly = true)
    public List<RecurringBooking> listMine(long userId) {
        return recurringBookingRepository.findAll().stream()
                .filter(r -> r.getBooker() != null && Objects.equals(r.getBooker().getId(), userId))
                .toList();
    }

    /** Called by scheduler — materializes the next few eligible occurrences. */
    @Transactional
    public void expandDueInstances() {
        LocalDate today = LocalDate.now();
        List<RecurringBooking> templates = recurringBookingRepository.findActiveTemplates(today);
        log.info("RecurringBooking expander: {} active template(s)", templates.size());
        for (RecurringBooking t : templates) {
            try {
                materializeNextWindow(t, today);
            } catch (Exception e) {
                log.warn("RecurringBooking id={} expand failed: {}", t.getId(), e.getMessage());
            }
        }
    }

    private void materializeNextWindow(RecurringBooking t, LocalDate today) {
        LocalDate startSearch = t.getLastMaterializedDate() != null
                ? t.getLastMaterializedDate().plusDays(1)
                : today;
        LocalDate horizon = today.plusWeeks(4);
        List<LocalDate> candidates = new ArrayList<>();
        LocalDate cursor = startSearch;
        while (!cursor.isAfter(horizon) && candidates.size() < 8) {
            if (matchesRecurrence(t, cursor)) {
                if (t.getActiveUntil() == null || !cursor.isAfter(t.getActiveUntil())) {
                    candidates.add(cursor);
                }
            }
            cursor = cursor.plusDays(1);
        }
        LocalDate lastOk = t.getLastMaterializedDate();
        for (LocalDate d : candidates) {
            CreateBookingRequest req = new CreateBookingRequest();
            req.setFieldId(t.getField().getId());
            req.setDateAppointment(d);
            req.setTimeAppointment(t.getStartTime());
            req.setDurationMinutes(t.getDurationMinutes());
            req.setTimeReservedField(Math.max(1, (int) Math.ceil(t.getDurationMinutes() / 60.0)));
            try {
                appointmentService.createBookingForUser(t.getBooker().getId(), req);
                lastOk = d;
            } catch (ResponseStatusException ex) {
                if (ex.getStatusCode() == HttpStatus.CONFLICT) {
                    log.info("RecurringBooking id={} skipped {} (conflict) — TASK 15", t.getId(), d);
                } else {
                    throw ex;
                }
            }
        }
        if (lastOk != null && (t.getLastMaterializedDate() == null || lastOk.isAfter(t.getLastMaterializedDate()))) {
            t.setLastMaterializedDate(lastOk);
            recurringBookingRepository.save(t);
        }
    }

    private static boolean matchesRecurrence(RecurringBooking t, LocalDate d) {
        if (t.getFrequency() == RecurrenceFrequency.WEEKLY) {
            return d.getDayOfWeek().getValue() == t.getDayOfWeek();
        }
        // MONTHLY expansion is field-specific; MVP expander only auto-books WEEKLY templates.
        return false;
    }
}
