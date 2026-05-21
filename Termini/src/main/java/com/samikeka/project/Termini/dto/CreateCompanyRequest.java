package com.samikeka.project.Termini.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CreateCompanyRequest {

    @NotBlank
    private String name;
}
