package com.samikeka.project.Termini.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class PaymentCheckoutResponse {
    private Long paymentId;
    private String redirectUrl;
    private BigDecimal amount;
    private String currency;
    private String provider;
    /** Shpjegim demo: ku shkon paraja (IBAN i pronarit). */
    private String mockPayoutNote;
}
