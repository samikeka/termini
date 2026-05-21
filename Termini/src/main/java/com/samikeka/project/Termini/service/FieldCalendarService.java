package com.samikeka.project.Termini.service;

import com.samikeka.project.Termini.dto.calendar.DayCalendarDto;
import com.samikeka.project.Termini.dto.calendar.MonthCalendarDto;
import com.samikeka.project.Termini.dto.calendar.SlotAvailability;
import com.samikeka.project.Termini.dto.calendar.SlotDto;
import com.samikeka.project.Termini.entity.Appointment;
import com.samikeka.project.Termini.entity.Field;
import com.samikeka.project.Termini.repository.AppointmentRepository;
import com.samikeka.project.Termini.repository.FieldRepository;
import com.samikeka.project.Termini.repository.ServiceOfferRepository;
import com.samikeka.project.Termini.service.booking.SportsOccupancy;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.time.LocalTime;
import java.time.YearMonth;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class FieldCalendarService {

    private static final int SLOT_START_HOUR = 8;
    private static final int SLOT_END_HOUR_EXCLUSIVE = 23;

    private final FieldRepository fieldRepository;
    private final AppointmentRepository appointmentRepository;
    private final ServiceOfferRepository serviceOfferRepository;

    public MonthCalendarDto monthCalendar(long fieldId, int year, int month) {
        if (month < 1 || month > 12) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "month must be 1-12");
        }
        Field field = fieldRepository.findById(fieldId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Field not found: " + fieldId));

        YearMonth ym = YearMonth.of(year, month);
        LocalDate first = ym.atDay(1);
        LocalDate last = ym.atEndOfMonth();
        List<Appointment> appts = appointmentRepository.findByFieldLocation_IdAndDateAppointmentBetween(
                fieldId, first, last);

        MonthCalendarDto out = new MonthCalendarDto();
        out.setFieldId(fieldId);
        out.setYear(year);
        out.setMonth(month);
        Integer sportsMinSession =
                SportsOccupancy.sportsMinSessionMinutes(field, serviceOfferRepository);

        List<DayCalendarDto> days = new ArrayList<>();
        for (LocalDate d = first; !d.isAfter(last); d = d.plusDays(1)) {
            final LocalDate day = d;
            days.add(daySlots(day, appts.stream()
                    .filter(a -> day.equals(a.getDateAppointment()))
                    .toList(), field, sportsMinSession));
        }
        out.setDays(days);
        return out;
    }

    private DayCalendarDto daySlots(
            LocalDate date,
            List<Appointment> dayAppointments,
            Field field,
            Integer sportsMinSessionMinutes
    ) {
        DayCalendarDto d = new DayCalendarDto();
        d.setDate(date);
        List<SlotDto> slots = new ArrayList<>();

        int step = field.getSlotCalendarMinutes() != null && field.getSlotCalendarMinutes() >= 15
                ? field.getSlotCalendarMinutes()
                : 60;

        LocalTime cursor = LocalTime.of(SLOT_START_HOUR, 0);
        LocalTime dayCutoff = LocalTime.of(SLOT_END_HOUR_EXCLUSIVE, 0);
        LocalDate today = LocalDate.now();
        LocalTime now = LocalTime.now();

        while (cursor.isBefore(dayCutoff)) {
            LocalTime slotEnd = cursor.plusMinutes(step);
            if (slotEnd.isAfter(dayCutoff)) {
                break;
            }
            SlotAvailability av = resolveAvailability(
                    date, today, now, cursor, slotEnd, dayAppointments, sportsMinSessionMinutes);
            boolean blocked = av != SlotAvailability.FREE;
            slots.add(new SlotDto(cursor.getHour(), cursor.getMinute(), blocked, av));
            cursor = slotEnd;
        }
        d.setSlots(slots);
        return d;
    }

    private static SlotAvailability resolveAvailability(
            LocalDate slotDate,
            LocalDate today,
            LocalTime now,
            LocalTime slotStart,
            LocalTime slotEnd,
            List<Appointment> dayAppointments,
            Integer sportsMinSessionMinutes
    ) {
        List<Appointment> overlapping = dayAppointments.stream()
                .filter(a -> overlaps(a, slotStart, slotEnd, sportsMinSessionMinutes))
                .toList();
        if (overlapping.isEmpty()) {
            return SlotAvailability.FREE;
        }
        boolean inSession = slotDate.equals(today);
        if (inSession) {
            for (Appointment a : overlapping) {
                LocalTime ast = a.getTimeAppointment();
                if (ast == null) {
                    continue;
                }
                int exMinutes = SportsOccupancy.effectiveDurationMinutes(a, sportsMinSessionMinutes);
                LocalTime aen = ast.plusMinutes(exMinutes);
                if (!now.isBefore(ast) && now.isBefore(aen)) {
                    return SlotAvailability.IN_PROGRESS;
                }
            }
        }
        return SlotAvailability.RESERVED;
    }

    private static boolean overlaps(
            Appointment a,
            LocalTime slotStart,
            LocalTime slotEnd,
            Integer sportsMinSessionMinutes
    ) {
        int exMinutes = SportsOccupancy.effectiveDurationMinutes(a, sportsMinSessionMinutes);
        LocalTime exStart = a.getTimeAppointment();
        if (exStart == null) {
            return false;
        }
        LocalTime exEnd = exStart.plusMinutes(exMinutes);
        return exStart.isBefore(slotEnd) && exEnd.isAfter(slotStart);
    }
}
