package com.samikeka.project.Termini.dto.mapper;

import com.samikeka.project.Termini.dto.AppointmentDto;
import com.samikeka.project.Termini.entity.Appointment;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring", uses = {FieldMapper.class})
public interface AppointmentMapper {
    @org.mapstruct.Mapping(source = "fieldLocation.id", target = "fieldId")
    @org.mapstruct.Mapping(source = "fieldLocation.name", target = "fieldName")
    @org.mapstruct.Mapping(source = "booker.id", target = "bookerUserId")
    @org.mapstruct.Mapping(source = "booker.name", target = "bookerName")
    @org.mapstruct.Mapping(source = "booker.email", target = "bookerEmail")
    @org.mapstruct.Mapping(source = "organizer.id", target = "organizerUserId")
    AppointmentDto toDto(Appointment appointment);

    @org.mapstruct.Mapping(target = "fieldLocation", ignore = true)
    @org.mapstruct.Mapping(target = "organizer", ignore = true)
    @org.mapstruct.Mapping(target = "booker", ignore = true)
    @org.mapstruct.Mapping(target = "matchParticipants", ignore = true)
    Appointment toEntity(AppointmentDto dto);
}
