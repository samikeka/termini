package com.samikeka.project.Termini.dto.clubcrm;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class CreateClubCrmRequest {

    @NotBlank
    @Size(max = 180)
    private String name;

    @Size(max = 512)
    private String logoUrl;

    @NotBlank
    @Size(max = 64)
    private String sportType;

    @NotBlank
    @Size(max = 255)
    private String location;

    /** Optional; defaults to FREE on server */
    @Size(max = 32)
    private String subscriptionPlan;
}
