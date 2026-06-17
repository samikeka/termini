package com.samikeka.project.Termini.dto;

import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
public class SeekPlayersRequestDto {
    private int playersNeeded;
    private BigDecimal totalFieldPrice;
    private boolean splitPaymentEnabled;
    private Integer splitAmongPlayerCount;
}
