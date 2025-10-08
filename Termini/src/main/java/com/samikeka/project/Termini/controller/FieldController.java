package com.samikeka.project.Termini.controller;

import com.samikeka.project.Termini.dto.FieldDto;
import com.samikeka.project.Termini.entity.Field;
import com.samikeka.project.Termini.service.IFieldService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.List;

@RestController
@RequestMapping("api/v1/fields")
@RequiredArgsConstructor
public class FieldController {
    private final IFieldService fieldService;

    @PostMapping
    public ResponseEntity<FieldDto> createField(@RequestBody FieldDto fieldDto) {
        FieldDto createdFieldDto = fieldService.createField(fieldDto);
        URI location = URI.create("/fields/" + createdFieldDto.getId());
        return ResponseEntity.created(location).body(createdFieldDto);
    }

    @GetMapping
    public ResponseEntity<List<FieldDto>> getAllfields() {
        return ResponseEntity.ok(fieldService.getAllFields());
    }
}
