package com.samikeka.project.Termini.dto;

import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/** Public snapshot of a player who joined a game (TASK 8 / Participant view). */
@Getter
@Setter
public class MatchParticipantBriefDto {
    private Long userId;
    private String displayName;
    private BigDecimal shareAmount;
    private LocalDateTime joinedAt;
}
