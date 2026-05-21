package com.samikeka.project.Termini.service;

import com.samikeka.project.Termini.dto.PlayerStatsPatchDto;
import com.samikeka.project.Termini.dto.UserDto;
import com.samikeka.project.Termini.entity.User;

import java.util.List;

public interface IUserService {
    List<UserDto> getAllUsers();

    UserDto getUserByUuid(Long id);

    void deleteUserByUuid(Long id);

    UserDto updateUserByUuid(Long id);

    User findByEmail(String email);

    List<UserDto> getLeaderboard(int limit);

    UserDto patchPlayerStats(Long id, PlayerStatsPatchDto dto);
}
