package com.samikeka.project.Termini.dto.mapper;

import com.samikeka.project.Termini.dto.AppointmentDto;
import com.samikeka.project.Termini.entity.Appointment;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring", uses = {FieldMapper.class})
public interface AppointmentMapper {
    AppointmentDto toDto(Appointment appointment);
    Appointment toEntity(AppointmentDto dto);
}
