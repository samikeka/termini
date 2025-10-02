package com.samikeka.project.Termini.repository;

import com.samikeka.project.Termini.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface UserRepository extends JpaRepository<User, UUID> {


}
