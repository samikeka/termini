package com.samikeka.project.Termini.service;

import com.samikeka.project.Termini.dto.AuthResponse;
import com.samikeka.project.Termini.dto.LoginRequest;
import com.samikeka.project.Termini.dto.RegisterOwnerRequest;
import com.samikeka.project.Termini.dto.RegisterRequest;
import com.samikeka.project.Termini.dto.UserDto;
import com.samikeka.project.Termini.dto.mapper.UserMapper;
import com.samikeka.project.Termini.entity.User;
import com.samikeka.project.Termini.entity.UserRole;
import com.samikeka.project.Termini.repository.UserRepository;
import com.samikeka.project.Termini.security.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final UserMapper userMapper;

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        userRepository.findByEmailIgnoreCase(request.getEmail().trim()).ifPresent(u -> {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Email already registered");
        });
        User user = new User();
        user.setName(request.getName().trim());
        user.setCity(request.getCity().trim());
        user.setEmail(request.getEmail().trim().toLowerCase());
        user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        user.setRole(UserRole.USER);
        User saved = userRepository.save(user);
        String token = jwtService.createToken(saved.getId(), saved.getEmail(), rolesFor(saved));
        return new AuthResponse(token, userMapper.toDto(saved));
    }

    @Transactional
    public AuthResponse registerOwner(RegisterOwnerRequest request) {
        userRepository.findByEmailIgnoreCase(request.getEmail().trim()).ifPresent(u -> {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Email already registered");
        });
        User user = new User();
        user.setName(request.getName().trim());
        user.setCity(request.getCity().trim());
        user.setEmail(request.getEmail().trim().toLowerCase());
        user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        user.setRole(UserRole.FIELD_OWNER);
        user.setOwnerIban(request.getOwnerIban().trim().replaceAll("\\s+", "").toUpperCase());
        user.setOwnerAccountHolder(request.getOwnerAccountHolder().trim());
        User saved = userRepository.save(user);
        String token = jwtService.createToken(saved.getId(), saved.getEmail(), rolesFor(saved));
        return new AuthResponse(token, userMapper.toDto(saved));
    }

    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByEmailIgnoreCase(request.getEmail().trim().toLowerCase())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid credentials"));
        if (user.getPasswordHash() == null
                || !passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid credentials");
        }
        String token = jwtService.createToken(user.getId(), user.getEmail(), rolesFor(user));
        return new AuthResponse(token, userMapper.toDto(user));
    }

    private static List<String> rolesFor(User u) {
        UserRole r = u.getRole() != null ? u.getRole() : UserRole.USER;
        if (r == UserRole.FIELD_OWNER) {
            return List.of("ROLE_USER", "ROLE_FIELD_OWNER");
        }
        if (r == UserRole.ADMIN) {
            return List.of("ROLE_USER", "ROLE_ADMIN");
        }
        return List.of("ROLE_USER");
    }
}
