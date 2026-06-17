package com.samikeka.project.Termini.dto;

import lombok.Getter;
import lombok.Setter;

import java.time.Instant;

@Getter
@Setter
public class OwnerNotificationDto {
    private Long id;
    private Long appointmentId;
    private String type;
    private String message;
    private boolean read;
    private Instant createdAt;
}
