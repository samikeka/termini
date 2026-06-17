package com.samikeka.project.Termini.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UserDto {
    private Long id;
    private String name;
    private String city;
    private String email;
    /** USER | FIELD_OWNER */
    private String role;
    private String ownerIban;
    private String ownerAccountHolder;
    private int goals;
    private int assists;
    private int mvpCount;
}
