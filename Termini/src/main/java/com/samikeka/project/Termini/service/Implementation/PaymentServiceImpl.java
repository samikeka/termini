package com.samikeka.project.Termini.service.Implementation;

import com.samikeka.project.Termini.dto.PaymentCheckoutRequest;
import com.samikeka.project.Termini.dto.PaymentCheckoutResponse;
import com.samikeka.project.Termini.entity.Appointment;
import com.samikeka.project.Termini.entity.Field;
import com.samikeka.project.Termini.entity.Payment;
import com.samikeka.project.Termini.entity.PaymentProvider;
import com.samikeka.project.Termini.entity.PaymentStatus;
import com.samikeka.project.Termini.entity.ServiceOffer;
import com.samikeka.project.Termini.entity.User;
import com.samikeka.project.Termini.repository.AppointmentRepository;
import com.samikeka.project.Termini.repository.PaymentRepository;
import com.samikeka.project.Termini.repository.ServiceOfferRepository;
import com.samikeka.project.Termini.repository.UserRepository;
import com.samikeka.project.Termini.service.PaymentService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.math.RoundingMode;

@Service
@RequiredArgsConstructor
@Slf4j
public class PaymentServiceImpl implements PaymentService {

    private final PaymentRepository paymentRepository;
    private final AppointmentRepository appointmentRepository;
    private final UserRepository userRepository;
    private final ServiceOfferRepository serviceOfferRepository;

    @Value("${termini.frontend-base-url:http://localhost:5173}")
    private String frontendBaseUrl;

    /** MOCK (default) or STRIPE_STUB for TASK 12 scaffolding. */
    @Value("${termini.payments.checkout-mode:MOCK}")
    private String checkoutMode;

    @Value("${termini.payments.platform-fee-percent:0}")
    private int platformFeePercent;

    @Override
    @Transactional
    public PaymentCheckoutResponse startCheckout(Long authenticatedUserId, PaymentCheckoutRequest request) {
        if (request.getAppointmentId() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "appointmentId required");
        }
        Appointment appointment = appointmentRepository.findById(request.getAppointmentId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Appointment not found"));
        User booker = appointment.getBooker();
        boolean guestBooking = booker == null;

        if (guestBooking) {
            if (!StringUtils.hasText(request.getGuestEmail())
                    || appointment.getGuestEmail() == null
                    || !appointment.getGuestEmail().equalsIgnoreCase(request.getGuestEmail().trim())) {
                throw new ResponseStatusException(HttpStatus.FORBIDDEN, "guestEmail must match the booking email");
            }
        } else {
            if (authenticatedUserId == null || !booker.getId().equals(authenticatedUserId)) {
                throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You can only pay for your own reservation");
            }
        }

        paymentRepository.findFirstByAppointmentAndStatus(appointment, PaymentStatus.COMPLETED)
                .ifPresent(p -> {
                    throw new ResponseStatusException(HttpStatus.CONFLICT, "This reservation is already paid");
                });

        BigDecimal amount = computeAmount(appointment);
        User payer = null;
        if (!guestBooking) {
            payer = userRepository.findById(authenticatedUserId)
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "User not found"));
        }

        Field field = appointment.getFieldLocation();
        User owner = field != null ? field.getFieldOwner() : null;
        String ownerIban = owner != null ? owner.getOwnerIban() : null;
        boolean stripeStub = "STRIPE_STUB".equalsIgnoreCase(checkoutMode);
        PaymentProvider provider = stripeStub ? PaymentProvider.STRIPE : PaymentProvider.MOCK;
        String payoutNote = stripeStub
                ? ("Stripe Checkout stub — Connect destination to owner wallet; offline IBAN fallback: "
                + maskIban(ownerIban))
                : buildMockPayoutNote(amount, owner, ownerIban);

        Payment payment = new Payment();
        payment.setAppointment(appointment);
        payment.setTenantId(appointment.getTenantId());
        payment.setPayer(payer);
        if (guestBooking) {
            payment.setGuestPayerEmail(appointment.getGuestEmail());
            payment.setGuestPayerName(appointment.getGuestName());
        } else {
            payment.setGuestPayerEmail(null);
            payment.setGuestPayerName(null);
        }
        payment.setAmount(amount);
        payment.setCurrency("EUR");
        payment.setStatus(PaymentStatus.PENDING);
        payment.setProvider(provider);
        payment.setExternalReference(stripeStub ? ("stripe_stub_" + System.currentTimeMillis()) : null);
        payment.setOwnerIbanSnapshot(ownerIban);
        payment.setPayoutNote(payoutNote);
        if (platformFeePercent > 0) {
            java.math.BigDecimal fee = amount
                    .multiply(java.math.BigDecimal.valueOf(platformFeePercent))
                    .divide(java.math.BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);
            payment.setPlatformFeeEur(fee);
        }
        Payment saved = paymentRepository.save(payment);

        String redirect = String.format(
                "%s/payment/complete?paymentId=%d",
                frontendBaseUrl.replaceAll("/$", ""),
                saved.getId());

        log.info("{} checkout paymentId={} amount={} EUR → owner payout snapshot IBAN={}",
                provider.name(), saved.getId(), amount, maskIban(ownerIban));

        return new PaymentCheckoutResponse(
                saved.getId(),
                redirect,
                amount,
                "EUR",
                provider.name(),
                payoutNote);
    }

    @Override
    @Transactional
    public void completeMockPayment(Long authenticatedUserId, String guestEmail, long paymentId) {
        Payment payment = paymentRepository.findById(paymentId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Payment not found"));
        if (payment.getPayer() != null) {
            if (authenticatedUserId == null || !payment.getPayer().getId().equals(authenticatedUserId)) {
                throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Not your payment");
            }
        } else {
            if (!StringUtils.hasText(guestEmail)
                    || payment.getGuestPayerEmail() == null
                    || !payment.getGuestPayerEmail().equalsIgnoreCase(guestEmail.trim())) {
                throw new ResponseStatusException(HttpStatus.FORBIDDEN, "guestEmail required and must match checkout");
            }
        }
        if (payment.getProvider() != PaymentProvider.MOCK && payment.getProvider() != PaymentProvider.STRIPE) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Unsupported provider for simulated completion");
        }
        if (payment.getStatus() != PaymentStatus.PENDING) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Payment already processed");
        }
        payment.setStatus(PaymentStatus.COMPLETED);
        paymentRepository.save(payment);
        log.info("MOCK payment completed id={} payoutNote={}", paymentId, payment.getPayoutNote());
    }

    private static String buildMockPayoutNote(BigDecimal amount, User owner, String ownerIban) {
        String holder = owner != null && StringUtils.hasText(owner.getOwnerAccountHolder())
                ? owner.getOwnerAccountHolder()
                : (owner != null ? owner.getName() : "pronari");
        if (!StringUtils.hasText(ownerIban)) {
            return String.format(
                    "MVP: %s € do të transferoheshin te pronari (%s) sapo të konfigurohet IBAN në profil.",
                    amount.toPlainString(),
                    holder);
        }
        return String.format(
                "MVP: %s € (mock) drejt llogarisë së pronarit %s — IBAN %s. Në prodhim: Stripe Connect / PSP.",
                amount.toPlainString(),
                holder,
                maskIban(ownerIban));
    }

    private static String maskIban(String iban) {
        if (!StringUtils.hasText(iban) || iban.length() < 8) {
            return iban;
        }
        return iban.substring(0, 4) + "…" + iban.substring(iban.length() - 4);
    }

    private BigDecimal computeAmount(Appointment appointment) {
        Field field = appointment.getFieldLocation();
        if (field == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Appointment has no field");
        }
        final int minutes = appointment.getDurationMinutes() != null
                ? appointment.getDurationMinutes()
                : ((appointment.getTimeReservedField() == null ? 1 : appointment.getTimeReservedField().intValue()) * 60);
        final int normalizedMinutes = minutes <= 0 ? 60 : minutes;

        // If offers exist, prefer fixed offer pricing for the selected duration.
        // (This enables minute-based packages for all services.)
        var offers = serviceOfferRepository.findByField_IdOrderByDurationMinutesAsc(field.getId());
        if (offers != null && !offers.isEmpty()) {
            ServiceOffer match = offers.stream()
                    .filter(o -> o.getDurationMinutes() != null && o.getDurationMinutes() == normalizedMinutes)
                    .findFirst()
                    .orElse(null);
            if (match != null && match.getPriceEur() != null && match.getPriceEur().signum() > 0) {
                return match.getPriceEur().setScale(2, RoundingMode.HALF_UP);
            }
        }

        BigDecimal hourly = field.getHourlyPriceEur();
        if (hourly == null || hourly.signum() <= 0) {
            return BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP);
        }
        BigDecimal hours = BigDecimal.valueOf(normalizedMinutes).divide(BigDecimal.valueOf(60), 4, RoundingMode.HALF_UP);
        return hourly.multiply(hours).setScale(2, RoundingMode.HALF_UP);
    }
}
