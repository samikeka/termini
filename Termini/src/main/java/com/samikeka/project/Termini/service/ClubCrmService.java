package com.samikeka.project.Termini.service;

import com.samikeka.project.Termini.clubcrm.*;
import com.samikeka.project.Termini.dto.clubcrm.ClubCrmDto;
import com.samikeka.project.Termini.dto.clubcrm.CreateClubCrmRequest;
import com.samikeka.project.Termini.entity.User;
import com.samikeka.project.Termini.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.*;

@Service
@RequiredArgsConstructor
public class ClubCrmService {

    private final ClubRepository clubRepository;
    private final ClubMemberRepository clubMemberRepository;
    private final UserRepository userRepository;

    @Transactional
    public ClubCrmDto createClub(long ownerUserId, CreateClubCrmRequest req) {
        User owner = userRepository.findById(ownerUserId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
        Club club = new Club();
        club.setName(req.getName().trim());
        club.setLogoUrl(req.getLogoUrl() != null && !req.getLogoUrl().isBlank() ? req.getLogoUrl().trim() : null);
        club.setSportType(req.getSportType().trim());
        club.setLocation(req.getLocation().trim());
        String plan = req.getSubscriptionPlan();
        club.setSubscriptionPlan(plan != null && !plan.isBlank() ? plan.trim() : "FREE");
        club.setOwner(owner);
        club = clubRepository.save(club);

        ClubMember membership = new ClubMember();
        membership.setClub(club);
        membership.setUser(owner);
        membership.setRole(ClubMemberRole.OWNER);
        membership.setStatus(ClubMemberStatus.ACTIVE);
        clubMemberRepository.save(membership);

        return toDto(club, ClubMemberRole.OWNER, ClubMemberStatus.ACTIVE);
    }

    @Transactional(readOnly = true)
    public List<ClubCrmDto> listMyClubs(long userId) {
        Map<Long, ClubCrmDto> byId = new LinkedHashMap<>();

        for (Club owned : clubRepository.findByOwner_Id(userId)) {
            byId.put(owned.getId(), toDto(owned, ClubMemberRole.OWNER, ClubMemberStatus.ACTIVE));
        }

        for (ClubMember m : clubMemberRepository.findByUser_IdAndStatus(userId, ClubMemberStatus.ACTIVE)) {
            Club c = m.getClub();
            ClubCrmDto built = toDto(c, m.getRole(), m.getStatus());
            byId.putIfAbsent(c.getId(), built);
        }

        return new ArrayList<>(byId.values());
    }

    @Transactional(readOnly = true)
    public ClubCrmDto getClub(long userId, long clubId) {
        Club club = clubRepository.findById(clubId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Club not found"));
        if (club.getOwner().getId().equals(userId)) {
            return toDto(club, ClubMemberRole.OWNER, ClubMemberStatus.ACTIVE);
        }
        ClubMember m = clubMemberRepository.findByClub_IdAndUser_Id(clubId, userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.FORBIDDEN, "Not a member of this club"));
        if (m.getStatus() != ClubMemberStatus.ACTIVE) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Membership not active");
        }
        return toDto(club, m.getRole(), m.getStatus());
    }

    private static ClubCrmDto toDto(Club club, ClubMemberRole myRole, ClubMemberStatus myStatus) {
        return ClubCrmDto.builder()
                .id(club.getId())
                .name(club.getName())
                .logoUrl(club.getLogoUrl())
                .sportType(club.getSportType())
                .ownerUserId(club.getOwner().getId())
                .location(club.getLocation())
                .subscriptionPlan(club.getSubscriptionPlan())
                .createdAt(club.getCreatedAt())
                .myRole(myRole)
                .myStatus(myStatus)
                .build();
    }
}
