package com.samikeka.project.Termini.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class PaymentCheckoutRequest {
    private Long appointmentId;

    /** Për rezervim mysafir: duhet të përputhet me email-in e rezervimit. */
    private String guestEmail;
}
