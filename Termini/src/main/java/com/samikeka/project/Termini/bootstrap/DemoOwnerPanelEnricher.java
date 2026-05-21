package com.samikeka.project.Termini.bootstrap;

import com.samikeka.project.Termini.entity.Appointment;
import com.samikeka.project.Termini.entity.CountryRegion;
import com.samikeka.project.Termini.entity.Field;
import com.samikeka.project.Termini.entity.ServiceCategory;
import com.samikeka.project.Termini.entity.User;
import com.samikeka.project.Termini.entity.UserRole;
import com.samikeka.project.Termini.repository.AppointmentRepository;
import com.samikeka.project.Termini.repository.FieldRepository;
import com.samikeka.project.Termini.repository.UserRepository;
import com.samikeka.project.Termini.service.OwnerNotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;

/**
 * Mbush terminet demo për panelin e pronarit edhe kur fushat ekzistojnë tashmë
 * (pa duhur ri-seed i plotë). Idempotent: nuk dyfishon të njëjtën orë/fushë/ditë.
 */
@Component
@Order(110)
@Slf4j
@RequiredArgsConstructor
public class DemoOwnerPanelEnricher implements CommandLineRunner {

    private final UserRepository userRepository;
    private final FieldRepository fieldRepository;
    private final AppointmentRepository appointmentRepository;
    private final OwnerNotificationService ownerNotificationService;
    private final PasswordEncoder passwordEncoder;

    @Value("${termini.demo-data.seed:true}")
    private boolean seedEnabled;

    @Value("${termini.demo-data.enrich-owner-panel:true}")
    private boolean enrichOwnerPanel;

    private record DemoSlot(LocalTime time, int durationMinutes, String guestLabel) {}

    @Override
    @Transactional
    public void run(String... args) {
        if (!seedEnabled || !enrichOwnerPanel) {
            return;
        }

        User player1 = userRepository.findByEmailIgnoreCase("player@termini.demo").orElse(null);
        User player2 = userRepository.findByEmailIgnoreCase("client2@termini.demo").orElse(null);
        User player3 = userRepository.findByEmailIgnoreCase("client3@termini.demo").orElse(null);

        int added = 0;
        added += enrichOwner(
                "owner@termini.demo",
                "Pronar Demo",
                "Prishtinë",
                CountryRegion.KOSOVO,
                "XK05123456789012345678901234",
                player1,
                player2,
                player3,
                List.of(
                        new DemoSlot(LocalTime.of(9, 0), 60, null),
                        new DemoSlot(LocalTime.of(12, 0), 60, "Ekipi Dardania"),
                        new DemoSlot(LocalTime.of(15, 0), 60, null),
                        new DemoSlot(LocalTime.of(18, 0), 90, "Liga e mbrëmjes"),
                        new DemoSlot(LocalTime.of(20, 0), 60, null)
                ));
        added += enrichOwner(
                "owner2@termini.demo",
                "Pronar 2",
                "Tiranë",
                CountryRegion.ALBANIA,
                "AL05123456789012345678901234",
                player2,
                player1,
                player3,
                List.of(
                        new DemoSlot(LocalTime.of(10, 0), 60, null),
                        new DemoSlot(LocalTime.of(14, 0), 60, "Grupi Blloku"),
                        new DemoSlot(LocalTime.of(17, 0), 60, null),
                        new DemoSlot(LocalTime.of(19, 30), 90, null)
                ));
        added += enrichOwner(
                "owner3@termini.demo",
                "Pronar 3",
                "Shkup",
                CountryRegion.NORTH_MACEDONIA,
                "MK05123456789012345678901234",
                player3,
                player1,
                player2,
                List.of(
                        new DemoSlot(LocalTime.of(11, 0), 60, null),
                        new DemoSlot(LocalTime.of(13, 0), 60, "Klient walk-in"),
                        new DemoSlot(LocalTime.of(16, 0), 60, null),
                        new DemoSlot(LocalTime.of(20, 0), 60, "Turneu mbrëmje")
                ));

        if (added > 0) {
            log.info("DemoOwnerPanelEnricher: u shtuan {} termine demo për panelin e pronarit (sot + nesër).", added);
        }
    }

    private int enrichOwner(
            String email,
            String name,
            String city,
            CountryRegion country,
            String iban,
            User bookerA,
            User bookerB,
            User bookerC,
            List<DemoSlot> todaySlots
    ) {
        User owner = upsertOwner(email, name, city, "terminiowner123", iban, name);
        Field field = primarySportsField(owner, name, city, country);
        if (field == null) {
            return 0;
        }

        LocalDate today = LocalDate.now();
        LocalDate tomorrow = today.plusDays(1);
        int added = 0;

        User[] rot = new User[] { bookerA, bookerB, bookerC };
        int ri = 0;
        for (DemoSlot slot : todaySlots) {
            if (trySeed(field, today, slot, rot[ri % rot.length], slot.guestLabel())) {
                added++;
            }
            ri++;
        }

        if (trySeed(field, tomorrow, new DemoSlot(LocalTime.of(10, 0), 60, null), bookerA, null)) {
            added++;
        }
        if (trySeed(field, tomorrow, new DemoSlot(LocalTime.of(18, 0), 60, null), bookerB, "Rezervim nesër")) {
            added++;
        }

        return added;
    }

    private boolean trySeed(Field field, LocalDate date, DemoSlot slot, User booker, String guestOverride) {
        if (!appointmentRepository
                .findByFieldLocationAndDateAppointmentAndTimeAppointment(field, date, slot.time())
                .isEmpty()) {
            return false;
        }
        Appointment a = new Appointment();
        a.setFieldLocation(field);
        a.setDateAppointment(date);
        a.setTimeAppointment(slot.time());
        a.setDurationMinutes(slot.durationMinutes());
        a.setTimeReservedField((byte) Math.max(1, (int) Math.ceil(slot.durationMinutes() / 60.0)));
        if (guestOverride != null && !guestOverride.isBlank()) {
            a.setBooker(null);
            a.setGuestName(guestOverride);
            a.setGuestEmail("guest.demo+" + field.getId() + "@termini.demo");
        } else if (booker != null) {
            a.setBooker(booker);
            a.setGuestName(null);
            a.setGuestEmail(null);
        } else {
            a.setBooker(null);
            a.setGuestName("Mysafir demo");
            a.setGuestEmail("mysafir@termini.demo");
        }
        a.setTenantId(field.getTenantId());
        Appointment saved = appointmentRepository.save(a);
        ownerNotificationService.notifyNewBooking(saved);
        return true;
    }

    private Field primarySportsField(User owner, String ownerLabel, String city, CountryRegion country) {
        List<Field> owned = fieldRepository.findByFieldOwner_IdOrderByNameAsc(owner.getId());
        Optional<Field> sports = owned.stream()
                .filter(f -> f.getCategory() == ServiceCategory.SPORTS)
                .findFirst();
        if (sports.isPresent()) {
            return sports.get();
        }
        if (!owned.isEmpty()) {
            return owned.get(0);
        }

        Field f = new Field();
        f.setName("Fushë Demo — " + ownerLabel);
        f.setLocation("Qendra sportive");
        f.setCity(city);
        f.setCountry(country);
        f.setCategory(ServiceCategory.SPORTS);
        f.setDefaultDurationMinutes(60);
        f.setHourlyPriceEur(new java.math.BigDecimal("40.00"));
        f.setFieldOwner(owner);
        f.setTenantId(owner.getId());
        f.setSlotCalendarMinutes(30);
        log.info("DemoOwnerPanelEnricher: u krijua fushë demo për {} → {}", owner.getEmail(), f.getName());
        return fieldRepository.save(f);
    }

    private User upsertOwner(
            String email,
            String name,
            String city,
            String password,
            String iban,
            String accountHolder
    ) {
        User u = userRepository.findByEmailIgnoreCase(email).orElseGet(User::new);
        u.setName(name);
        u.setCity(city);
        u.setEmail(email);
        u.setRole(UserRole.FIELD_OWNER);
        u.setOwnerIban(iban);
        u.setOwnerAccountHolder(accountHolder);
        String h = u.getPasswordHash();
        if (h == null || h.isBlank() || !passwordEncoder.matches(password, h)) {
            u.setPasswordHash(passwordEncoder.encode(password));
        }
        return userRepository.save(u);
    }
}
