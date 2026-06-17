package com.samikeka.project.Termini.repository;

import com.samikeka.project.Termini.entity.Company;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CompanyRepository extends JpaRepository<Company, Long> {

    List<Company> findByAdminUserId(Long adminUserId);
}
