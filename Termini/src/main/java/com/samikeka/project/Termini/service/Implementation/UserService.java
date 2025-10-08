package com.samikeka.project.Termini.service.Implementation;


import com.samikeka.project.Termini.dto.UserDto;
import com.samikeka.project.Termini.dto.mapper.UserMapper;
import com.samikeka.project.Termini.entity.User;
import com.samikeka.project.Termini.repository.UserRepository;
import com.samikeka.project.Termini.service.IUserService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class UserService implements IUserService{
    private final UserRepository userRepository;
    private final UserMapper userMapper;


    @Override
    public UserDto createUser(UserDto userDto) {
        User userEntity = userMapper.toEntity(userDto);
        User userSaved = userRepository.save(userEntity);
        return userMapper.toDto(userSaved);
    }
}

