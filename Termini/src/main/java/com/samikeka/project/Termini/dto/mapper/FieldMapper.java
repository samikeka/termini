package com.samikeka.project.Termini.dto.mapper;

import com.samikeka.project.Termini.dto.FieldDto;
import com.samikeka.project.Termini.entity.Field;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface FieldMapper {


    // Entity -> DTO
    FieldDto toDto(Field field);

    // DTO -> Entity
    Field toEntity(FieldDto dto);
}
