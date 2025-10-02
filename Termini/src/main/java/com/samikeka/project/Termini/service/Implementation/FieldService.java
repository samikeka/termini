package com.samikeka.project.Termini.service.Implementation;

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

@Service
@RequiredArgsConstructor
public class FieldService implements IFieldService {
    private final FieldRepository fieldRepository;
    private final UserRepository userRepository;
    @Override
    public Field createField(Field field) {
        UUID uuid = field.getFieldOwner().getUuid();
        Optional<User> userById = userRepository.findById(uuid);
        if(userById.isEmpty()){
            throw new RuntimeException("Ky user me kete id nuk ekziston "+ field.getFieldOwner().getUuid());
        }
        field.setFieldOwner(userById.get());
        return fieldRepository.save(field);
    }

    @Override
    public List<Field> getAllFields() {
        return fieldRepository.findAll();
    }
}
