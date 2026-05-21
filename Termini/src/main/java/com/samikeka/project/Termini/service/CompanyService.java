package com.samikeka.project.Termini.service;

import com.samikeka.project.Termini.dto.CompanyDto;
import com.samikeka.project.Termini.dto.CreateCompanyRequest;
import com.samikeka.project.Termini.entity.Company;
import com.samikeka.project.Termini.entity.CompanyMembership;
import com.samikeka.project.Termini.entity.CompanyMembershipRole;
import com.samikeka.project.Termini.entity.User;
import com.samikeka.project.Termini.repository.CompanyMembershipRepository;
import com.samikeka.project.Termini.repository.CompanyRepository;
import com.samikeka.project.Termini.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CompanyService {

    private final CompanyRepository companyRepository;
    private final CompanyMembershipRepository membershipRepository;
    private final UserRepository userRepository;

    @Transactional
    public CompanyDto createCompany(long principalUserId, CreateCompanyRequest req) {
        Company c = new Company();
        c.setName(req.getName().trim());
        c.setAdminUserId(principalUserId);
        Company saved = companyRepository.save(c);
        User u = userRepository.findById(principalUserId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "User not found"));
        CompanyMembership m = new CompanyMembership();
        m.setCompany(saved);
        m.setUser(u);
        m.setRole(CompanyMembershipRole.ADMIN);
        membershipRepository.save(m);
        return toDto(saved);
    }

    @Transactional(readOnly = true)
    public List<CompanyDto> listMine(long userId) {
        return membershipRepository.findByUser_Id(userId).stream()
                .map(CompanyMembership::getCompany)
                .distinct()
                .map(this::toDto)
                .toList();
    }

    @Transactional
    public void addMemberByEmail(long principalUserId, long companyId, String email) {
        Company c = companyRepository.findById(companyId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Company not found"));
        if (!c.getAdminUserId().equals(principalUserId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only company admin can invite");
        }
        User invitee = userRepository.findByEmailIgnoreCase(email.trim().toLowerCase())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "No user with that email"));
        if (membershipRepository.existsByCompany_IdAndUser_Id(companyId, invitee.getId())) {
            return;
        }
        CompanyMembership m = new CompanyMembership();
        m.setCompany(c);
        m.setUser(invitee);
        m.setRole(CompanyMembershipRole.EMPLOYEE);
        membershipRepository.save(m);
    }

    private CompanyDto toDto(Company c) {
        CompanyDto d = new CompanyDto();
        d.setId(c.getId());
        d.setName(c.getName());
        d.setAdminUserId(c.getAdminUserId());
        return d;
    }
}
