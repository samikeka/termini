package com.samikeka.project.Termini.service.Implementation;

import com.samikeka.project.Termini.dto.FieldDto;
import com.samikeka.project.Termini.dto.mapper.FieldMapper;
import com.samikeka.project.Termini.entity.Field;
import com.samikeka.project.Termini.entity.User;
import com.samikeka.project.Termini.repository.FieldRepository;
import com.samikeka.project.Termini.repository.UserRepository;
import com.samikeka.project.Termini.service.IFieldService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class FieldService implements IFieldService {
    private final FieldRepository fieldRepository;
    private final UserRepository userRepository;
    private final FieldMapper fieldMapper;
    @Override
    public FieldDto createField(FieldDto fieldDto) {
//        UUID uuid = field.getFieldOwner().getUuid();
        UUID uuid = fieldDto.getFieldOwner().getUuid();
        Optional<User> userById = userRepository.findById(uuid);
        if(userById.isEmpty()){
            throw new RuntimeException("Ky user me kete id nuk ekziston "+ fieldDto.getFieldOwner().getUuid());
        }
//        fieldDto.setFieldOwner(userById.get());
        Field fieldEntity = fieldMapper.toEntity(fieldDto);
        Field savedField = fieldRepository.save(fieldEntity);

        return fieldMapper.toDto(savedField);
    }

    @Override
    public List<FieldDto> getAllFields() {
        List<Field> fields = fieldRepository.findAll();

        return fields.stream().map(fieldMapper::toDto).toList();
    }
}
