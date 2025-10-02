package com.samikeka.project.Termini.service;

import com.samikeka.project.Termini.entity.Field;

import java.util.List;
import java.util.UUID;

public interface IFieldService {
    Field createField(Field field);
    List<Field> getAllFields();
}
