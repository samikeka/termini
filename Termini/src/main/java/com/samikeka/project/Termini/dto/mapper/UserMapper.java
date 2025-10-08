package com.samikeka.project.Termini.dto.mapper;

import com.samikeka.project.Termini.dto.UserDto;
import com.samikeka.project.Termini.entity.User;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface UserMapper {


    // Entity -> DTO
    UserDto toDto(User user);

    // DTO -> Entity
    User toEntity(UserDto dto);
}
