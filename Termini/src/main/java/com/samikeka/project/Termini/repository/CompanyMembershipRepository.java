package com.samikeka.project.Termini.repository;

import com.samikeka.project.Termini.entity.Company;
import com.samikeka.project.Termini.entity.CompanyMembership;
import com.samikeka.project.Termini.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface CompanyMembershipRepository extends JpaRepository<CompanyMembership, Long> {

    List<CompanyMembership> findByCompany(Company company);

    List<CompanyMembership> findByUser_Id(Long userId);

    Optional<CompanyMembership> findByCompany_IdAndUser_Id(Long companyId, Long userId);

    boolean existsByCompany_IdAndUser_Id(Long companyId, Long userId);
}
