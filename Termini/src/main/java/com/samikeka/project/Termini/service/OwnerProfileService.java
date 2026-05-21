package com.samikeka.project.Termini.service;

import com.samikeka.project.Termini.dto.OwnerPayoutProfileDto;
import com.samikeka.project.Termini.dto.UserDto;
import com.samikeka.project.Termini.dto.mapper.UserMapper;
import com.samikeka.project.Termini.entity.User;
import com.samikeka.project.Termini.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.springframework.web.server.ResponseStatusException;

@Service
@RequiredArgsConstructor
public class OwnerProfileService {

    private final UserRepository userRepository;
    private final UserMapper userMapper;

    @Transactional(readOnly = true)
    public OwnerPayoutProfileDto getPayoutProfile(long ownerUserId) {
        User u = userRepository.findById(ownerUserId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
        OwnerPayoutProfileDto d = new OwnerPayoutProfileDto();
        d.setOwnerIban(u.getOwnerIban());
        d.setOwnerAccountHolder(u.getOwnerAccountHolder());
        return d;
    }

    @Transactional
    public UserDto updatePayoutProfile(long ownerUserId, OwnerPayoutProfileDto body) {
        if (body == null
                || !StringUtils.hasText(body.getOwnerIban())
                || !StringUtils.hasText(body.getOwnerAccountHolder())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "ownerIban and ownerAccountHolder required");
        }
        String iban = body.getOwnerIban().trim().replaceAll("\\s+", "").toUpperCase();
        if (iban.length() < 15 || iban.length() > 34) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid IBAN length");
        }
        User u = userRepository.findById(ownerUserId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
        u.setOwnerIban(iban);
        u.setOwnerAccountHolder(body.getOwnerAccountHolder().trim());
        return userMapper.toDto(userRepository.save(u));
    }
}
