package com.samikeka.project.Termini.service;

import com.samikeka.project.Termini.dto.PaymentCheckoutRequest;
import com.samikeka.project.Termini.dto.PaymentCheckoutResponse;

public interface PaymentService {

    PaymentCheckoutResponse startCheckout(Long authenticatedUserId, PaymentCheckoutRequest request);

    void completeMockPayment(Long authenticatedUserId, String guestEmail, long paymentId);
}
