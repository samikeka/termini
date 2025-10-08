package com.samikeka.project.Termini.dto;

import lombok.Getter;
import lombok.Setter;

import java.util.UUID;

@Getter
@Setter
public class FieldDto {
    private UUID id;
    private String name;
    private String location;
    private String city;
    private UserDto fieldOwner;
}
