package com.samikeka.project.Termini.dto;

import com.samikeka.project.Termini.entity.Field;
import lombok.Getter;
import lombok.Setter;

import java.util.List;
import java.util.UUID;

@Getter
@Setter
public class UserDto {
    private UUID uuid;
    private String name;
    private String city;
    private List<FieldDto> fieldsDto;
}
