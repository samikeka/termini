package com.samikeka.project.Termini.dto.mapper;

import com.samikeka.project.Termini.dto.FieldDto;
import com.samikeka.project.Termini.entity.Field;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface FieldMapper {

    FieldDto toDto(Field field);

    Field toEntity(FieldDto dto);
}
