package com.samikeka.project.Termini.dto;

import lombok.Getter;
import lombok.Setter;

/** For guest checkout: same email used when booking must be sent here. */
@Getter
@Setter
public class PaymentMockCompleteRequest {
    private String guestEmail;
}
