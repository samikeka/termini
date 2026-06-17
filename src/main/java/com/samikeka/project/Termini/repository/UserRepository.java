package com.samikeka.project.Termini.repository;

import com.samikeka.project.Termini.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {

    User findByEmail(String email);

    Optional<User> findByEmailIgnoreCase(String email);

    List<User> findByOrderByGoalsDescAssistsDescMvpCountDesc(Pageable pageable);
}
