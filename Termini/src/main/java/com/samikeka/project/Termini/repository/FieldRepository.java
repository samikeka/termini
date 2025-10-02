package com.samikeka.project.Termini.repository;

import com.samikeka.project.Termini.entity.Field;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface FieldRepository extends JpaRepository<Field, UUID> {


}
