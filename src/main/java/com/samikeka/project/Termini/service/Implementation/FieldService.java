package com.samikeka.project.Termini.service.Implementation;

import com.samikeka.project.Termini.dto.FieldDto;
import com.samikeka.project.Termini.dto.mapper.FieldMapper;
import com.samikeka.project.Termini.entity.CountryRegion;
import com.samikeka.project.Termini.entity.Field;
import com.samikeka.project.Termini.entity.ServiceCategory;
import com.samikeka.project.Termini.entity.User;
import com.samikeka.project.Termini.repository.FieldRepository;
import com.samikeka.project.Termini.repository.UserRepository;
import com.samikeka.project.Termini.security.SecurityUtils;
import com.samikeka.project.Termini.service.IFieldService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class FieldService implements IFieldService {
    private final FieldRepository fieldRepository;
    private final UserRepository userRepository;
    private final FieldMapper fieldMapper;

    @Override
    public FieldDto createField(FieldDto fieldDto) {
        long principalId = SecurityUtils.requireUserId();
        Optional<User> userById = userRepository.findById(principalId);
        if (userById.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "User not found: " + principalId);
        }
        Field fieldEntity = fieldMapper.toEntity(fieldDto);
        if (fieldEntity.getCountry() == null) {
            fieldEntity.setCountry(CountryRegion.KOSOVO);
        }
        fieldEntity.setFieldOwner(userById.get());
        fieldEntity.setTenantId(userById.get().getId());
        Field savedField = fieldRepository.save(fieldEntity);
        return fieldMapper.toDto(savedField);
    }

    @Override
    public List<FieldDto> listFields(CountryRegion country, ServiceCategory category, String city) {
        List<Field> list;
        String cityTrim = city != null ? city.trim() : "";
        if (country != null && category != null && !cityTrim.isEmpty()) {
            list = fieldRepository.findByCountryAndCategoryAndCityContainingIgnoreCase(country, category, cityTrim);
        } else if (country != null && category != null) {
            list = fieldRepository.findByCountryAndCategory(country, category);
        } else if (country != null && !cityTrim.isEmpty()) {
            list = fieldRepository.findByCountryAndCityContainingIgnoreCase(country, cityTrim);
        } else if (country != null) {
            list = fieldRepository.findByCountry(country);
        } else if (category != null && !cityTrim.isEmpty()) {
            list = fieldRepository.findByCategoryAndCityContainingIgnoreCase(category, cityTrim);
        } else if (category != null) {
            list = fieldRepository.findByCategory(category);
        } else if (!cityTrim.isEmpty()) {
            list = fieldRepository.findByCityContainingIgnoreCase(cityTrim);
        } else {
            list = fieldRepository.findAll();
        }
        return list.stream().map(fieldMapper::toDto).toList();
    }

    @Override
    public FieldDto getFieldById(long fieldId) {
        Field field = fieldRepository.findById(fieldId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Field not found: " + fieldId));
        return fieldMapper.toDto(field);
    }

    @Override
    public List<FieldDto> listFieldsOwnedBy(long ownerUserId) {
        return fieldRepository.findByFieldOwner_IdOrderByNameAsc(ownerUserId).stream()
                .map(fieldMapper::toDto)
                .toList();
    }
}
