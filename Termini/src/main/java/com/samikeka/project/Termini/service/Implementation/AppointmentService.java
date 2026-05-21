package com.samikeka.project.Termini.service.Implementation;

import com.samikeka.project.Termini.dto.AppointmentDto;
import com.samikeka.project.Termini.dto.CreateBookingRequest;
import com.samikeka.project.Termini.dto.mapper.AppointmentMapper;
import com.samikeka.project.Termini.entity.Appointment;
import com.samikeka.project.Termini.entity.Field;
import com.samikeka.project.Termini.entity.User;
import com.samikeka.project.Termini.realtime.RealtimeNotifier;
import com.samikeka.project.Termini.repository.AppointmentRepository;
import com.samikeka.project.Termini.repository.FieldRepository;
import com.samikeka.project.Termini.repository.PaymentRepository;
import com.samikeka.project.Termini.repository.ServiceOfferRepository;
import com.samikeka.project.Termini.repository.UserRepository;
import com.samikeka.project.Termini.security.SecurityUtils;
import com.samikeka.project.Termini.service.GameRequestService;
import com.samikeka.project.Termini.service.IAppointmentService;
import com.samikeka.project.Termini.service.OwnerNotificationService;
import com.samikeka.project.Termini.service.booking.SportsOccupancy;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;


@Service
public class AppointmentService implements IAppointmentService {

    private final AppointmentRepository appointmentRepository;
    private final FieldRepository fieldRepository;
    private final UserRepository userRepository;
    private final PaymentRepository paymentRepository;
    private final ServiceOfferRepository serviceOfferRepository;
    private final OwnerNotificationService ownerNotificationService;
    private final AppointmentMapper appointmentMapper;
    private final GameRequestService gameRequestService;
    private final RealtimeNotifier realtimeNotifier;

    public AppointmentService(
            AppointmentRepository appointmentRepository,
            FieldRepository fieldRepository,
            UserRepository userRepository,
            PaymentRepository paymentRepository,
            ServiceOfferRepository serviceOfferRepository,
            OwnerNotificationService ownerNotificationService,
            AppointmentMapper appointmentMapper,
            GameRequestService gameRequestService,
            RealtimeNotifier realtimeNotifier) {
        this.appointmentRepository = appointmentRepository;
        this.fieldRepository = fieldRepository;
        this.userRepository = userRepository;
        this.paymentRepository = paymentRepository;
        this.serviceOfferRepository = serviceOfferRepository;
        this.ownerNotificationService = ownerNotificationService;
        this.appointmentMapper = appointmentMapper;
        this.gameRequestService = gameRequestService;
        this.realtimeNotifier = realtimeNotifier;
    }

    @Override
    @Transactional
    public Appointment createBooking(CreateBookingRequest req) {
        return createBookingResolved(req, null);
    }

    @Override
    @Transactional
    public Appointment createBookingForUser(long bookerUserId, CreateBookingRequest req) {
        User booker = userRepository.findById(bookerUserId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "User not found: " + bookerUserId));
        return createBookingResolved(req, booker);
    }

    private Appointment createBookingResolved(CreateBookingRequest req, User forcedBooker) {
        if (req.getFieldId() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "fieldId required");
        }
        if (req.getDateAppointment() == null || req.getTimeAppointment() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "date/time required");
        }

        Field field = fieldRepository.findById(req.getFieldId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Field not found: " + req.getFieldId()));
        Long tenantId = field.getFieldOwner() != null ? field.getFieldOwner().getId() : null;

        Appointment appointment = new Appointment();
        appointment.setFieldLocation(field);
        appointment.setTenantId(tenantId);
        appointment.setDateAppointment(req.getDateAppointment());
        appointment.setTimeAppointment(req.getTimeAppointment());

        int reservedHours = req.getTimeReservedField() == null ? 1 : req.getTimeReservedField();
        Integer durationMinutes = req.getDurationMinutes();
        if (durationMinutes == null) {
            durationMinutes = Math.max(15, reservedHours * 60);
        }
        appointment.setDurationMinutes(durationMinutes);
        appointment.setTimeReservedField((byte) reservedHours);

        appointment.setOrganizer(null);
        appointment.setTotalFieldPrice(null);
        appointment.setSplitPaymentEnabled(false);
        appointment.setSplitAmongPlayerCount(null);
        appointment.setMatchParticipants(null);

        User booker;
        if (forcedBooker != null) {
            booker = forcedBooker;
            appointment.setBooker(booker);
            appointment.setGuestName(null);
            appointment.setGuestEmail(null);
        } else {
            Optional<Long> uid = SecurityUtils.optionalUserId();
            if (uid.isPresent()) {
                booker = userRepository.findById(uid.get())
                        .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "User not found: " + uid.get()));
                appointment.setBooker(booker);
                appointment.setGuestName(null);
                appointment.setGuestEmail(null);
            } else {
                booker = null;
                if (req.getGuestName() == null || req.getGuestName().isBlank()
                        || req.getGuestEmail() == null || req.getGuestEmail().isBlank()) {
                    throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "guestName and guestEmail required without login");
                }
                appointment.setBooker(null);
                appointment.setGuestName(req.getGuestName().trim());
                appointment.setGuestEmail(req.getGuestEmail().trim().toLowerCase());
            }
        }

        applyOpenJoinSlots(req, booker, appointment);

        LocalTime newStart = appointment.getTimeAppointment();
        LocalTime newEnd = newStart.plusMinutes(durationMinutes);

        List<Appointment> existing = appointmentRepository.findForFieldAndDayForUpdate(field.getId(), appointment.getDateAppointment());
        Integer sportsMin = SportsOccupancy.sportsMinSessionMinutes(field, serviceOfferRepository);

        for (Appointment ex : existing) {
            LocalTime exStart = ex.getTimeAppointment();
            if (exStart == null) {
                continue;
            }
            int exMinutes = SportsOccupancy.effectiveDurationMinutes(ex, sportsMin);
            LocalTime exEnd = exStart.plusMinutes(exMinutes);

            boolean overlap = newStart.isBefore(exEnd) && newEnd.isAfter(exStart);
            if (overlap) {
                throw new ResponseStatusException(HttpStatus.CONFLICT,
                        String.format("Conflict with appointment %s [%s-%s]", ex.getAppointmentId(), exStart, exEnd));
            }
        }

        Appointment saved = appointmentRepository.save(appointment);
        ownerNotificationService.notifyNewBooking(saved);

        if (saved.isSeekingPlayers()) {
            gameRequestService.upsertOpen(saved, saved.getTenantId());
            Map<String, Object> ev = new HashMap<>();
            ev.put("type", "PLAYERS_MISSING");
            ev.put("tenantId", saved.getTenantId());
            ev.put("fieldId", field.getId());
            ev.put("appointmentId", saved.getAppointmentId());
            ev.put("playersNeeded", saved.getPlayersNeeded());
            realtimeNotifier.publish(ev);
        }

        Map<String, Object> created = new HashMap<>();
        created.put("type", "BOOKING_CREATED");
        created.put("tenantId", saved.getTenantId());
        created.put("fieldId", field.getId());
        created.put("appointmentId", saved.getAppointmentId());
        realtimeNotifier.publish(created);

        return saved;
    }

    private static void applyOpenJoinSlots(CreateBookingRequest req, User booker, Appointment appointment) {
        if (req.getOpenJoinSlots() == null) {
            appointment.setSeekingPlayers(false);
            appointment.setPlayersNeeded(null);
            return;
        }
        if (req.getOpenJoinSlots() < 1) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "openJoinSlots must be at least 1");
        }
        if (booker == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "openJoinSlots requires an authenticated booker");
        }
        appointment.setSeekingPlayers(true);
        appointment.setOrganizer(booker);
        appointment.setPlayersNeeded(req.getOpenJoinSlots());
    }

    @Override
    @Transactional
    public void cancelAppointmentAsOwner(long ownerUserId, long appointmentId) {
        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Appointment not found: " + appointmentId));
        Field field = appointment.getFieldLocation();
        if (field == null
                || field.getFieldOwner() == null
                || !Objects.equals(field.getFieldOwner().getId(), ownerUserId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only the field owner can cancel this booking");
        }
        gameRequestService.deleteForAppointment(appointmentId);
        ownerNotificationService.deleteForAppointment(appointmentId);
        paymentRepository.deleteForAppointmentId(appointmentId);
        appointmentRepository.delete(appointment);
    }

    @Override
    public List<Appointment> getAllAppointment() {
        return appointmentRepository.findAll();
    }

    @Override
    public List<Appointment> getAppointmentsByFieldId(Long fieldId) {
        return appointmentRepository.findByFieldLocation_Id(fieldId);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Appointment> getMyAppointmentsForField(Long fieldId, Long userId) {
        return appointmentRepository.findByFieldLocation_Id(fieldId).stream()
                .filter(a -> a.getBooker() != null && Objects.equals(a.getBooker().getId(), userId))
                .toList();
    }

    @Override
    public List<AppointmentDto> getAllAppointmentsOfOwnerById(Long id) {
        List<Appointment> byFieldOwnerUuid = appointmentRepository.findByFieldLocationFieldOwnerId(id);
        return byFieldOwnerUuid.stream().map(appointmentMapper::toDto).toList();
    }

    @Override
    public List<AppointmentDto> getAppointmentsForOwnerField(long ownerUserId, long fieldId) {
        Field field = fieldRepository.findById(fieldId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Field not found: " + fieldId));
        if (field.getFieldOwner() == null || !Objects.equals(field.getFieldOwner().getId(), ownerUserId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "This field is not yours");
        }
        return appointmentRepository.findByFieldLocation_Id(fieldId).stream()
                .map(appointmentMapper::toDto)
                .toList();
    }
}
