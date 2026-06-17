package com.samikeka.project.Termini.dto;

import com.samikeka.project.Termini.entity.CountryRegion;
import com.samikeka.project.Termini.entity.ServiceCategory;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
public class FieldDto {
    private Long id;
    private String name;
    private String location;
    private String city;
    private String coverImageUrl;
    private CountryRegion country;
    private BigDecimal hourlyPriceEur;
    private ServiceCategory category;
    private Integer defaultDurationMinutes;
    /** Calendar slot step for public grid (minutes). */
    private Integer slotCalendarMinutes;
    private UserDto fieldOwner;
}
