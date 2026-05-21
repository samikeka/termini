package com.samikeka.project.Termini.dto;

import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
public class JoinMatchResultDto {
    private Long appointmentId;
    private Long userId;
    private BigDecimal shareAmount;
    private long joinedCount;
    private long spotsRemaining;
}
