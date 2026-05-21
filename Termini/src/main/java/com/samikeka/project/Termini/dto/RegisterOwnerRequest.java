package com.samikeka.project.Termini.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class RegisterOwnerRequest {

    @NotBlank
    private String name;

    @NotBlank
    private String city;

    @NotBlank
    @Email
    private String email;

    @NotBlank
    @Size(min = 8)
    private String password;

    @NotBlank
    @Size(min = 15, max = 34)
    private String ownerIban;

    @NotBlank
    private String ownerAccountHolder;
}
