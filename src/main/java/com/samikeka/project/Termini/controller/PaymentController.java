package com.samikeka.project.Termini.controller;

import com.samikeka.project.Termini.dto.PaymentCheckoutRequest;
import com.samikeka.project.Termini.dto.PaymentCheckoutResponse;
import com.samikeka.project.Termini.dto.PaymentMockCompleteRequest;
import com.samikeka.project.Termini.security.SecurityUtils;
import com.samikeka.project.Termini.service.PaymentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/payments")
@RequiredArgsConstructor
@Tag(name = "Payments", description = "Pagesë online (MVP: mock checkout; Stripe më vonë)")
public class PaymentController {

    private final PaymentService paymentService;

    @Operation(summary = "Nis pagesën për një rezervim (kthen URL për front-end)")
    @PostMapping("/checkout")
    public ResponseEntity<PaymentCheckoutResponse> checkout(@RequestBody PaymentCheckoutRequest body) {
        Long userId = SecurityUtils.optionalUserId().orElse(null);
        return ResponseEntity.ok(paymentService.startCheckout(userId, body));
    }

    @Operation(summary = "Konfirmo pagesën MOCK (për demo / zhvillim)")
    @PostMapping("/mock/complete/{paymentId}")
    public ResponseEntity<Void> completeMock(
            @PathVariable long paymentId,
            @RequestBody(required = false) PaymentMockCompleteRequest body) {
        Long userId = SecurityUtils.optionalUserId().orElse(null);
        String guestEmail = body != null ? body.getGuestEmail() : null;
        paymentService.completeMockPayment(userId, guestEmail, paymentId);
        return ResponseEntity.noContent().build();
    }
}
