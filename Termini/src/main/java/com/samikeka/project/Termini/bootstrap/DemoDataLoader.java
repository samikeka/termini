package com.samikeka.project.Termini.bootstrap;

import com.samikeka.project.Termini.entity.Company;
import com.samikeka.project.Termini.entity.CompanyMembership;
import com.samikeka.project.Termini.entity.CompanyMembershipRole;
import com.samikeka.project.Termini.entity.CountryRegion;
import com.samikeka.project.Termini.entity.Appointment;
import com.samikeka.project.Termini.entity.Field;
import com.samikeka.project.Termini.entity.MatchParticipant;
import com.samikeka.project.Termini.entity.RecurrenceFrequency;
import com.samikeka.project.Termini.entity.RecurringBooking;
import com.samikeka.project.Termini.entity.ServiceCategory;
import com.samikeka.project.Termini.entity.ServiceOffer;
import com.samikeka.project.Termini.entity.User;
import com.samikeka.project.Termini.entity.UserRole;
import com.samikeka.project.Termini.repository.AppointmentRepository;
import com.samikeka.project.Termini.repository.CompanyMembershipRepository;
import com.samikeka.project.Termini.repository.CompanyRepository;
import com.samikeka.project.Termini.repository.FieldRepository;
import com.samikeka.project.Termini.repository.GameRequestRepository;
import com.samikeka.project.Termini.repository.MatchParticipantRepository;
import com.samikeka.project.Termini.repository.OwnerNotificationRepository;
import com.samikeka.project.Termini.repository.PaymentRepository;
import com.samikeka.project.Termini.repository.RecurringBookingRepository;
import com.samikeka.project.Termini.repository.ServiceOfferRepository;
import com.samikeka.project.Termini.repository.UserRepository;
import com.samikeka.project.Termini.service.GameRequestService;
import com.samikeka.project.Termini.service.OwnerNotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;

/**
 * Krijon përdorues demo dhe fusha kur databaza është bosh (për testim lokal).
 */
@Component
@Order(100)
@Slf4j
@RequiredArgsConstructor
public class DemoDataLoader implements CommandLineRunner {

    private final UserRepository userRepository;
    private final FieldRepository fieldRepository;
    private final AppointmentRepository appointmentRepository;
    private final MatchParticipantRepository matchParticipantRepository;
    private final GameRequestRepository gameRequestRepository;
    private final CompanyRepository companyRepository;
    private final CompanyMembershipRepository companyMembershipRepository;
    private final RecurringBookingRepository recurringBookingRepository;
    private final OwnerNotificationRepository ownerNotificationRepository;
    private final PaymentRepository paymentRepository;
    private final ServiceOfferRepository serviceOfferRepository;
    private final OwnerNotificationService ownerNotificationService;
    private final GameRequestService gameRequestService;
    private final PasswordEncoder passwordEncoder;

    @Value("${termini.demo-data.seed:true}")
    private boolean seedEnabled;

    @Value("${termini.demo-data.force:false}")
    private boolean forceSeed;

    @Value("${termini.demo-data.reset:false}")
    private boolean resetBeforeSeed;

    @Override
    @Transactional
    public void run(String... args) {
        if (!seedEnabled) {
            return;
        }
        if (resetBeforeSeed) {
            log.warn("DemoDataLoader: termini.demo-data.reset=true → deleting existing demo data first");
            // order matters due to foreign keys
            matchParticipantRepository.deleteAll();
            gameRequestRepository.deleteAll();
            companyMembershipRepository.deleteAll();
            companyRepository.deleteAll();
            recurringBookingRepository.deleteAll();
            ownerNotificationRepository.deleteAll();
            paymentRepository.deleteAll();
            appointmentRepository.deleteAll();
            fieldRepository.deleteAll();
        }

        SeededUsers su = ensureDemoUsersAndCompany();

        if (!forceSeed && fieldRepository.count() > 0) {
            log.info("DemoDataLoader: fields already present — skipping field/booking seed; demo accounts ensured (player@termini.demo / terminiplayer123).");
            return;
        }

        User owner1 = su.owner1();
        User owner2 = su.owner2();
        User owner3 = su.owner3();
        User player1 = su.player1();
        User player2 = su.player2();
        User player3 = su.player3();
        User admin = su.admin();

        // SPORTS
        Field f1 = createField(owner1, "Arena Prishtina 5v5", "Rr. Agim Ramadani", "Prishtinë", CountryRegion.KOSOVO, ServiceCategory.SPORTS, 60, "45.00");
        Field f2 = createField(owner1, "Elite Indoor Pejë", "Indoor, sipërfaqe artificiale", "Pejë", CountryRegion.KOSOVO, ServiceCategory.SPORTS, 60, "50.00");
        Field f3 = createField(owner2, "Tirana Arena 5v5", "Laprakë", "Tiranë", CountryRegion.ALBANIA, ServiceCategory.SPORTS, 60, "42.00");
        Field f4 = createField(owner3, "Skopje City Arena 5v5", "Centar", "Shkup", CountryRegion.NORTH_MACEDONIA, ServiceCategory.SPORTS, 60, "36.00");
        seedOffers(f1,
                offer("5v5 Indoor", 60, "45.00"),
                offer("7v7 Outdoor", 90, "65.00"),
                offer("11v11 (Stadium)", 120, "90.00"));
        seedOffers(f2,
                offer("5v5 Indoor", 60, "50.00"),
                offer("7v7 Indoor", 90, "72.00"));
        seedOffers(f3,
                offer("5v5", 60, "42.00"),
                offer("7v7", 90, "60.00"));
        seedOffers(f4,
                offer("5v5", 60, "36.00"),
                offer("7v7", 90, "55.00"));

        /** Outdoor falas — pa pagesë, vetëm lokacion dhe rezervim slot-i */
        createField(owner2, "Fushë Futboll Outdoor — Liqeni Tiranë", "Zona e Liqenit Artificial", "Tiranë",
                CountryRegion.ALBANIA, ServiceCategory.SPORTS, 60, null);
        createField(owner1, "Basketboll Outdoor — Parku i Germisë", "Zona rekreative", "Prishtinë",
                CountryRegion.KOSOVO, ServiceCategory.SPORTS, 60, null);

        Field spTennis = createField(owner1, "Tenis Club Prishtina — Outdoor", "Velani", "Prishtinë",
                CountryRegion.KOSOVO, ServiceCategory.SPORTS, 60, "22.00");
        Field spBasket = createField(owner2, "Basket Arena Durrës", "Pleiada", "Durrës",
                CountryRegion.ALBANIA, ServiceCategory.SPORTS, 60, "40.00");
        Field spVolej = createField(owner3, "Volej Beach Shkup", "Gradski Park", "Shkup",
                CountryRegion.NORTH_MACEDONIA, ServiceCategory.SPORTS, 90, "30.00");
        Field spHendbal = createField(owner1, "Hendbal Hall Pejë", "Sportski centar", "Pejë",
                CountryRegion.KOSOVO, ServiceCategory.SPORTS, 60, "35.00");
        Field spPadel = createField(owner2, "Padel Club Tirana", "Kombinat", "Tiranë",
                CountryRegion.ALBANIA, ServiceCategory.SPORTS, 60, "28.00");
        Field spMulti = createField(owner3, "MultiSport Arena Tetovë", "Qendër", "Tetovë",
                CountryRegion.NORTH_MACEDONIA, ServiceCategory.SPORTS, 60, "25.00");
        seedOffers(spTennis, offer("Court 60'", 60, "22.00"));
        seedOffers(spBasket, offer("Full court 60'", 60, "40.00"));
        seedOffers(spVolej, offer("Sand court 90'", 90, "30.00"));
        seedOffers(spHendbal, offer("Hall 60'", 60, "35.00"));
        seedOffers(spPadel, offer("Padel court 60'", 60, "28.00"));
        seedOffers(spMulti, offer("Multi-use 60'", 60, "25.00"));

        // BEAUTY / HEALTH / AUTO (demo “all services”)
        Field b1 = createField(owner1, "StyleLab Barber", "Rruga UÇK", "Prishtinë", CountryRegion.KOSOVO, ServiceCategory.BEAUTY, 30, "12.00");
        Field b2 = createField(owner1, "Sallon Bukurie Prizren", "Shadërvan", "Prizren", CountryRegion.KOSOVO, ServiceCategory.BEAUTY, 45, "16.00");
        Field b3 = createField(owner2, "Nail Studio Tiranë", "Blloku", "Tiranë", CountryRegion.ALBANIA, ServiceCategory.BEAUTY, 45, "14.00");
        Field b4 = createField(owner3, "Barber Tetovë", "Qendër", "Tetovë", CountryRegion.NORTH_MACEDONIA, ServiceCategory.BEAUTY, 30, "10.00");
        seedOffers(b1,
                offer("Haircut", 20, "12.00"),
                offer("Beard Trim", 15, "7.00"),
                offer("Haircut + Beard", 35, "18.00"),
                offer("Shave", 20, "10.00"));
        seedOffers(b2,
                offer("Makeup", 60, "22.00"),
                offer("Hair Styling", 45, "16.00"),
                offer("Brows", 20, "8.00"));
        seedOffers(b3,
                offer("Manicure", 45, "14.00"),
                offer("Pedicure", 60, "18.00"),
                offer("Gel Polish", 45, "16.00"));
        seedOffers(b4,
                offer("Haircut", 20, "10.00"),
                offer("Beard", 15, "6.00"),
                offer("Combo", 35, "14.00"));
        Field h1 = createField(owner2, "Dermatologji Tiranë", "Blloku", "Tiranë", CountryRegion.ALBANIA, ServiceCategory.HEALTH, 30, "22.00");
        Field h2 = createField(owner1, "Fizioterapi Prishtinë", "Qendra", "Prishtinë", CountryRegion.KOSOVO, ServiceCategory.HEALTH, 60, "25.00");
        Field h3 = createField(owner3, "Klinikë Dentare Shkup", "Centar", "Shkup", CountryRegion.NORTH_MACEDONIA, ServiceCategory.HEALTH, 30, "18.00");
        seedOffers(h1,
                offer("Consultation", 30, "22.00"),
                offer("Follow-up", 15, "10.00"));
        seedOffers(h2,
                offer("Physio Session", 60, "25.00"),
                offer("Massage", 60, "30.00"),
                offer("Consultation", 30, "15.00"));
        seedOffers(h3,
                offer("Dental Check", 30, "18.00"),
                offer("Cleaning", 60, "35.00"));
        Field a1 = createField(owner3, "Car Wash Shkup", "Rr. kryesore", "Shkup", CountryRegion.NORTH_MACEDONIA, ServiceCategory.AUTO, 30, "8.00");
        Field a2 = createField(owner2, "Servis i Shpejtë Tiranë", "Qendra", "Tiranë", CountryRegion.ALBANIA, ServiceCategory.AUTO, 45, "20.00");
        Field a3 = createField(owner1, "Vulcanizer Ferizaj", "Qendra", "Ferizaj", CountryRegion.KOSOVO, ServiceCategory.AUTO, 30, "6.00");
        seedOffers(a1,
                offer("Basic Wash", 30, "8.00"),
                offer("Interior Cleaning", 60, "18.00"));
        seedOffers(a2,
                offer("Diagnostics", 30, "15.00"),
                offer("Oil Change", 45, "22.00"));
        seedOffers(a3,
                offer("Tire Repair", 30, "6.00"),
                offer("Season Change", 60, "12.00"));

        // PROFESSIONAL (avokat, kontabilist, noteri, konsulencë)
        Field p1 = createField(owner1, "Avokat Prishtina (Këshillim)", "Qendra", "Prishtinë", CountryRegion.KOSOVO, ServiceCategory.PROFESSIONAL, 45, "30.00");
        Field p2 = createField(owner2, "Noter Tiranë", "Blloku", "Tiranë", CountryRegion.ALBANIA, ServiceCategory.PROFESSIONAL, 30, "20.00");
        Field p3 = createField(owner3, "Kontabilist Shkup", "Centar", "Shkup", CountryRegion.NORTH_MACEDONIA, ServiceCategory.PROFESSIONAL, 60, "25.00");
        Field p4 = createField(owner1, "Avokat Pejë (Kontratë)", "Qendra", "Pejë", CountryRegion.KOSOVO, ServiceCategory.PROFESSIONAL, 30, "25.00");
        Field p5 = createField(owner3, "Konsulencë Biznesi Tetovë", "Qendër", "Tetovë", CountryRegion.NORTH_MACEDONIA, ServiceCategory.PROFESSIONAL, 45, "28.00");
        seedOffers(p1,
                offer("Consultation", 45, "30.00"),
                offer("Document Review", 30, "20.00"));
        seedOffers(p2,
                offer("Notary Service", 20, "18.00"),
                offer("Document Certification", 30, "20.00"));
        seedOffers(p3,
                offer("Consultation", 60, "25.00"),
                offer("Monthly Package", 60, "40.00"));
        seedOffers(p4,
                offer("Contract Draft", 60, "45.00"),
                offer("Consultation", 30, "25.00"));
        seedOffers(p5,
                offer("Consultation", 45, "28.00"),
                offer("Strategy Session", 60, "40.00"));

        // More mock variety across cities
        Field e1 = createField(owner2, "Trajnim Anglisht Tiranë", "Qendra", "Tiranë", CountryRegion.ALBANIA, ServiceCategory.EDUCATION, 60, "12.00");
        Field e2 = createField(owner1, "Kurs Programimi Prishtinë", "Qendra", "Prishtinë", CountryRegion.KOSOVO, ServiceCategory.EDUCATION, 90, "15.00");
        seedOffers(e1,
                offer("Lesson (1:1)", 60, "12.00"),
                offer("Exam Prep", 90, "18.00"));
        seedOffers(e2,
                offer("Mentoring", 45, "10.00"),
                offer("Lesson", 90, "15.00"));
        Field e3 = createField(owner3, "Mësime Matematike Shkup", "Centar", "Shkup", CountryRegion.NORTH_MACEDONIA, ServiceCategory.EDUCATION, 60, "10.00");
        Field e4 = createField(owner2, "Autoshkollë Durrës", "Qendra", "Durrës", CountryRegion.ALBANIA, ServiceCategory.EDUCATION, 90, "20.00");
        Field o1 = createField(owner1, "Pizzeria Napoli", "Qendra", "Prishtinë", CountryRegion.KOSOVO, ServiceCategory.OTHER, 60, "5.00");
        Field o2 = createField(owner2, "Restaurant Gusto", "Blloku", "Tiranë", CountryRegion.ALBANIA, ServiceCategory.OTHER, 60, "5.00");
        Field o3 = createField(owner3, "Restaurant Old Bazaar", "Çarshia", "Shkup", CountryRegion.NORTH_MACEDONIA, ServiceCategory.OTHER, 60, "5.00");
        Field o4 = createField(owner1, "Sushi & More Prishtina", "Qendra", "Prishtinë", CountryRegion.KOSOVO, ServiceCategory.OTHER, 60, "5.00");
        Field o5 = createField(owner2, "Pastiçeri Durrës", "Shëtitorja", "Durrës", CountryRegion.ALBANIA, ServiceCategory.OTHER, 60, "4.00");
        Field o6 = createField(owner1, "Restaurant Rugova", "Qendra", "Pejë", CountryRegion.KOSOVO, ServiceCategory.OTHER, 60, "5.00");
        Field o7 = createField(owner3, "Coffee & Brunch Tetovë", "Qendër", "Tetovë", CountryRegion.NORTH_MACEDONIA, ServiceCategory.OTHER, 60, "4.00");
        Field o8 = createField(owner2, "Seafood Vlora", "Lungomare", "Vlorë", CountryRegion.ALBANIA, ServiceCategory.OTHER, 60, "6.00");

        // Extra BEAUTY / HEALTH / AUTO / PROFESSIONAL entries
        Field b5 = createField(owner2, "Hair Studio Durrës", "Shëtitorja", "Durrës", CountryRegion.ALBANIA, ServiceCategory.BEAUTY, 30, "11.00");
        Field h4 = createField(owner1, "Klinikë Shëndeti Pejë", "Qendra", "Pejë", CountryRegion.KOSOVO, ServiceCategory.HEALTH, 30, "16.00");
        Field a4 = createField(owner3, "Detailing Tetovë", "Qendër", "Tetovë", CountryRegion.NORTH_MACEDONIA, ServiceCategory.AUTO, 60, "28.00");
        Field p6 = createField(owner2, "Avokat Tiranë (Këshillim)", "Blloku", "Tiranë", CountryRegion.ALBANIA, ServiceCategory.PROFESSIONAL, 45, "32.00");
        Field p7 = createField(owner1, "Noter Prishtinë", "Qendra", "Prishtinë", CountryRegion.KOSOVO, ServiceCategory.PROFESSIONAL, 30, "18.00");

        // Bookings (për të parë klientët + izolimin e pronarëve)
        LocalDate d1 = LocalDate.now().plusDays(1);
        LocalDate d2 = LocalDate.now().plusDays(2);
        seedBooking(f1, d1, LocalTime.of(18, 0), 90, player1, null, null);
        seedBooking(f2, d1, LocalTime.of(20, 0), 60, null, "Guest One", "guest1@example.com");
        seedBooking(f3, d2, LocalTime.of(19, 0), 60, player2, null, null);
        seedBooking(f4, d2, LocalTime.of(17, 0), 120, player3, null, null);
        seedBooking(b1, d1, LocalTime.of(11, 0), 30, null, "Guest Barber", "barber.guest@example.com");
        seedBooking(h1, d2, LocalTime.of(10, 0), 30, player2, null, null);
        seedBooking(a1, d1, LocalTime.of(9, 0), 30, player3, null, null);
        seedBooking(p1, d2, LocalTime.of(14, 0), 45, null, "Guest Lawyer", "law.guest@example.com");
        seedBooking(e1, d2, LocalTime.of(16, 0), 60, player1, null, null);
        seedBooking(o1, d1, LocalTime.of(13, 0), 60, null, "Guest Pizza", "pizza.guest@example.com");
        seedBooking(o2, d2, LocalTime.of(19, 0), 60, player2, null, null);
        seedBooking(o3, d1, LocalTime.of(20, 0), 60, null, "Guest Restaurant", "rest.guest@example.com");
        seedBooking(b2, d2, LocalTime.of(12, 0), 45, player1, null, null);
        seedBooking(b3, d1, LocalTime.of(15, 0), 45, null, "Guest Nails", "nails.guest@example.com");
        seedBooking(p2, d1, LocalTime.of(10, 0), 30, player2, null, null);
        seedBooking(p3, d2, LocalTime.of(9, 0), 60, player3, null, null);
        seedBooking(o6, d2, LocalTime.of(18, 0), 60, null, "Guest Dinner", "dinner.guest@example.com");
        seedBooking(o7, d1, LocalTime.of(10, 0), 60, player3, null, null);
        seedBooking(e3, d1, LocalTime.of(17, 0), 60, player3, null, null);
        seedBooking(e4, d2, LocalTime.of(12, 0), 90, null, "Guest Lesson", "lesson.guest@example.com");
        seedRecurringWeekly(f1, player1, owner1.getId(), 1, LocalTime.of(20, 0), 60, d2.plusMonths(2));
        seedBooking(b5, d1, LocalTime.of(14, 0), 30, player2, null, null);
        seedBooking(h4, d2, LocalTime.of(11, 0), 30, null, "Guest Clinic", "clinic.guest@example.com");
        seedBooking(a4, d1, LocalTime.of(16, 0), 60, player3, null, null);
        seedBooking(p6, d2, LocalTime.of(15, 0), 45, player2, null, null);
        seedBooking(p7, d1, LocalTime.of(9, 0), 30, null, "Guest Notary", "notary.guest@example.com");

        // Sot / nesër — dashboard & kalendar i pronarit duken “gjallë”
        LocalDate today = LocalDate.now();
        LocalDate tomorrow = today.plusDays(1);
        seedBooking(f1, today, LocalTime.of(9, 0), 60, player2, null, null);
        seedBooking(f1, today, LocalTime.of(14, 30), 60, player3, null, null);
        seedBooking(f3, today, LocalTime.of(11, 0), 60, player1, null, null);
        seedBooking(spBasket, today, LocalTime.of(16, 0), 60, null, "Walk-in Demo", "walkin@demo.termini");
        seedBooking(f2, tomorrow, LocalTime.of(10, 0), 60, player1, null, null);
        seedBooking(spTennis, tomorrow, LocalTime.of(17, 0), 60, player2, null, null);

        // Lojëra të hapura (/matches) — një me bashkëlojtar, dy të lira
        Appointment open1 = seedBooking(f2, today.plusDays(3), LocalTime.of(18, 0), 60, player1, null, null);
        configureOpenMatch(open1, player1, 4, new BigDecimal("50.00"), true, 4);
        seedJoinerForMatch(open1, player2, new BigDecimal("12.50"));
        Appointment open2 = seedBooking(f3, today.plusDays(4), LocalTime.of(20, 0), 60, player2, null, null);
        configureOpenMatch(open2, player2, 3, null, false, null);
        Appointment open3 = seedBooking(f4, today.plusDays(6), LocalTime.of(19, 30), 90, player3, null, null);
        configureOpenMatch(open3, player3, 5, new BigDecimal("36.00"), true, 6);

        log.info("DemoDataLoader: u krijuan {} shërbime mock + {} bookings + admin={} (owners isolated)",
                fieldRepository.count(), appointmentRepository.count(), admin.getEmail());
    }

    private record SeededUsers(
            User owner1,
            User owner2,
            User owner3,
            User player1,
            User player2,
            User player3,
            User admin
    ) {}

    /**
     * Gjithmonë në boot kur demo-data është aktiv: llogaritë demo + kompania B2B,
     * edhe kur full field seed anashkalohet (DB me fusha por pa user demo).
     */
    private SeededUsers ensureDemoUsersAndCompany() {
        User owner1 = upsertOwner("owner@termini.demo", "Pronar Demo", "Prishtinë", "terminiowner123",
                "XK05123456789012345678901234", "Pronar Demo");
        User owner2 = upsertOwner("owner2@termini.demo", "Pronar 2", "Tiranë", "terminiowner123",
                "AL05123456789012345678901234", "Pronar 2");
        User owner3 = upsertOwner("owner3@termini.demo", "Pronar 3", "Shkup", "terminiowner123",
                "MK05123456789012345678901234", "Pronar 3");

        User player1 = upsertUser("player@termini.demo", "Lojtar Demo", "Prishtinë", "terminiplayer123");
        User player2 = upsertUser("client2@termini.demo", "Klient 2", "Tiranë", "terminiplayer123");
        User player3 = upsertUser("client3@termini.demo", "Klient 3", "Shkup", "terminiplayer123");
        User admin = upsertAdmin("admin@termini.demo", "Admin Demo", "Prishtinë", "terminiadmin123");

        Company demoCo = upsertCompany("Termini Logistics Demo", player1.getId());
        attachMemberIfMissing(demoCo, player1);
        attachMemberIfMissing(demoCo, player2);

        return new SeededUsers(owner1, owner2, owner3, player1, player2, player3, admin);
    }

    private void ensurePasswordMatches(User u, String plainPassword) {
        String h = u.getPasswordHash();
        if (h == null || h.isBlank() || !passwordEncoder.matches(plainPassword, h)) {
            u.setPasswordHash(passwordEncoder.encode(plainPassword));
        }
    }

    private User upsertAdmin(String email, String name, String city, String password) {
        User u = userRepository.findByEmailIgnoreCase(email).orElseGet(User::new);
        u.setName(name);
        u.setCity(city);
        u.setEmail(email);
        u.setRole(UserRole.ADMIN);
        ensurePasswordMatches(u, password);
        return userRepository.save(u);
    }

    private Company upsertCompany(String name, long adminUserId) {
        List<Company> existing = companyRepository.findByAdminUserId(adminUserId);
        for (Company c : existing) {
            if (name.equalsIgnoreCase(c.getName())) {
                return c;
            }
        }
        Company c = new Company();
        c.setName(name);
        c.setAdminUserId(adminUserId);
        return companyRepository.save(c);
    }

    private void attachMemberIfMissing(Company company, User user) {
        if (companyMembershipRepository.findByCompany_IdAndUser_Id(company.getId(), user.getId()).isPresent()) {
            return;
        }
        CompanyMembership m = new CompanyMembership();
        m.setCompany(company);
        m.setUser(user);
        m.setRole(user.getId().equals(company.getAdminUserId())
                ? CompanyMembershipRole.ADMIN
                : CompanyMembershipRole.EMPLOYEE);
        companyMembershipRepository.save(m);
    }

    private void seedRecurringWeekly(
            Field field,
            User booker,
            long tenantId,
            int isoDow,
            LocalTime start,
            int durationMinutes,
            LocalDate activeUntil
    ) {
        RecurringBooking r = new RecurringBooking();
        r.setField(field);
        r.setBooker(booker);
        r.setFrequency(RecurrenceFrequency.WEEKLY);
        r.setDayOfWeek(isoDow);
        r.setStartTime(start);
        r.setDurationMinutes(durationMinutes);
        r.setActiveUntil(activeUntil);
        r.setPaused(false);
        r.setTenantId(tenantId);
        recurringBookingRepository.save(r);
    }

    private User upsertOwner(String email, String name, String city, String password, String iban, String accountHolder) {
        User u = userRepository.findByEmailIgnoreCase(email).orElseGet(User::new);
        u.setName(name);
        u.setCity(city);
        u.setEmail(email);
        u.setRole(UserRole.FIELD_OWNER);
        u.setOwnerIban(iban);
        u.setOwnerAccountHolder(accountHolder);
        ensurePasswordMatches(u, password);
        return userRepository.save(u);
    }

    private User upsertUser(String email, String name, String city, String password) {
        User u = userRepository.findByEmailIgnoreCase(email).orElseGet(User::new);
        u.setName(name);
        u.setCity(city);
        u.setEmail(email);
        u.setRole(UserRole.USER);
        ensurePasswordMatches(u, password);
        return userRepository.save(u);
    }

    private Appointment seedBooking(
            Field field,
            LocalDate date,
            LocalTime time,
            int durationMinutes,
            User booker,
            String guestName,
            String guestEmail
    ) {
        Appointment a = new Appointment();
        a.setFieldLocation(field);
        a.setDateAppointment(date);
        a.setTimeAppointment(time);
        a.setDurationMinutes(durationMinutes);
        a.setTimeReservedField((byte) Math.max(1, (int) Math.ceil(durationMinutes / 60.0)));
        a.setBooker(booker);
        a.setGuestName(guestName);
        a.setGuestEmail(guestEmail);
        a.setTenantId(field.getTenantId());
        Appointment saved = appointmentRepository.save(a);
        ownerNotificationService.notifyNewBooking(saved);
        return saved;
    }

    private void configureOpenMatch(
            Appointment a,
            User organizer,
            int playersNeeded,
            BigDecimal totalFieldPrice,
            boolean splitPaymentEnabled,
            Integer splitAmongPlayerCount
    ) {
        a.setOrganizer(organizer);
        a.setSeekingPlayers(true);
        a.setPlayersNeeded(playersNeeded);
        a.setTotalFieldPrice(totalFieldPrice);
        a.setSplitPaymentEnabled(splitPaymentEnabled);
        a.setSplitAmongPlayerCount(splitAmongPlayerCount);
        appointmentRepository.save(a);
        gameRequestService.upsertOpen(a, a.getTenantId());
    }

    private void seedJoinerForMatch(Appointment a, User player, BigDecimal shareAmount) {
        MatchParticipant m = new MatchParticipant();
        m.setAppointment(a);
        m.setPlayer(player);
        m.setShareAmount(shareAmount);
        m.setJoinedAt(LocalDateTime.now());
        matchParticipantRepository.save(m);
    }

    private Field createField(
            User owner,
            String name,
            String location,
            String city,
            CountryRegion country,
            ServiceCategory category,
            int defaultDurationMinutes,
            String hourly) {
        Field f = new Field();
        f.setName(name);
        f.setLocation(location);
        f.setCity(city);
        f.setCountry(country);
        f.setCategory(category);
        f.setDefaultDurationMinutes(defaultDurationMinutes);
        if (hourly != null && !hourly.isBlank()) {
            f.setHourlyPriceEur(new BigDecimal(hourly));
        } else {
            f.setHourlyPriceEur(null);
        }
        f.setFieldOwner(owner);
        f.setTenantId(owner.getId());
        f.setSlotCalendarMinutes(category == ServiceCategory.SPORTS ? 30 : 60);
        return fieldRepository.save(f);
    }

    private ServiceOffer offer(String name, int minutes, String price) {
        ServiceOffer o = new ServiceOffer();
        o.setName(name);
        o.setDurationMinutes(minutes);
        o.setPriceEur(new BigDecimal(price));
        return o;
    }

    private void seedOffers(Field field, ServiceOffer... offers) {
        if (field == null || offers == null) return;
        for (ServiceOffer o : offers) {
            if (o == null) continue;
            o.setField(field);
            o.setTenantId(field.getTenantId());
            serviceOfferRepository.save(o);
        }
    }
}
