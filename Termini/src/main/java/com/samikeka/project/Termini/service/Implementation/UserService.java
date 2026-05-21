package com.samikeka.project.Termini.service.Implementation;


import com.samikeka.project.Termini.dto.PlayerStatsPatchDto;
import com.samikeka.project.Termini.dto.UserDto;
import com.samikeka.project.Termini.dto.mapper.UserMapper;
import com.samikeka.project.Termini.entity.User;
import com.samikeka.project.Termini.repository.UserRepository;
import com.samikeka.project.Termini.service.IUserService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class UserService implements IUserService{
    private final UserRepository userRepository;
    private final UserMapper userMapper;


    @Override
    public List<UserDto> getAllUsers() {
        return userRepository.findAll().stream().map(userMapper::toDto).toList();
    }

    @Override
    public UserDto getUserByUuid(Long id) {
        Optional<User> byId = userRepository.findById(id);
        if(byId.isEmpty()) throw new RuntimeException("This user doesn't exist with uuid "+ id);

        User user = byId.get();
        return userMapper.toDto(user);
    }

    @Override
    public void deleteUserByUuid(Long id) {
        userRepository.deleteById(id);
    }

    @Override
    public UserDto updateUserByUuid(Long id) {
        UserDto userByUuid = getUserByUuid(id);
        User entity = userMapper.toEntity(userByUuid);
        User save = userRepository.save(entity);
        return userMapper.toDto(save);
    }

    @Override
    public User findByEmail(String email) {
        return userRepository.findByEmail(email);
    }

    @Override
    public List<UserDto> getLeaderboard(int limit) {
        int cap = Math.min(Math.max(limit, 1), 100);
        return userRepository.findByOrderByGoalsDescAssistsDescMvpCountDesc(PageRequest.of(0, cap)).stream()
                .map(userMapper::toDto)
                .peek(d -> {
                    d.setOwnerIban(null);
                    d.setOwnerAccountHolder(null);
                    d.setRole(null);
                })
                .toList();
    }

    @Override
    @Transactional
    public UserDto patchPlayerStats(Long id, PlayerStatsPatchDto dto) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found: " + id));
        user.setGoals(Math.max(0, user.getGoals() + dto.getGoalsDelta()));
        user.setAssists(Math.max(0, user.getAssists() + dto.getAssistsDelta()));
        user.setMvpCount(Math.max(0, user.getMvpCount() + dto.getMvpDelta()));
        return userMapper.toDto(userRepository.save(user));
    }

}

