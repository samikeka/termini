package com.samikeka.project.Termini.service;

import com.samikeka.project.Termini.dto.FieldDto;
import com.samikeka.project.Termini.entity.Field;

import java.util.List;
import java.util.UUID;

public interface IFieldService {
    FieldDto createField(FieldDto fieldDto);
    List<FieldDto> getAllFields();
}
