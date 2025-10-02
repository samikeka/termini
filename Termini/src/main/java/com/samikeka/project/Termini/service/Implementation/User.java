package com.samikeka.project.Termini.service.Implementation;


import com.samikeka.project.Termini.repository.UserRepository;
import com.samikeka.project.Termini.service.IUserService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class User implements IUserService{
    private final UserRepository userRepository;

    @Override
    public com.samikeka.project.Termini.entity.User createUser(com.samikeka.project.Termini.entity.User user) {
        return userRepository.save(user);
    }
}

