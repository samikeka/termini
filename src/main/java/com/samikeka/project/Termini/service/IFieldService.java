package com.samikeka.project.Termini.service;

import com.samikeka.project.Termini.dto.FieldDto;
import com.samikeka.project.Termini.entity.CountryRegion;
import com.samikeka.project.Termini.entity.ServiceCategory;

import java.util.List;

public interface IFieldService {
    FieldDto createField(FieldDto fieldDto);

    List<FieldDto> listFields(CountryRegion country, ServiceCategory category, String city);

    FieldDto getFieldById(long fieldId);

    List<FieldDto> listFieldsOwnedBy(long ownerUserId);
}
