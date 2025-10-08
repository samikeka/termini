package com.samikeka.project.Termini.service;

import com.samikeka.project.Termini.dto.UserDto;
import com.samikeka.project.Termini.entity.User;

public interface IUserService {
        UserDto createUser(UserDto userDto);
}
