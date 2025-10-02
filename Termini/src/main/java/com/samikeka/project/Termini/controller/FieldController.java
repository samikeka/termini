package com.samikeka.project.Termini.controller;

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
    public ResponseEntity<Field> createField(@RequestBody Field field) {
        Field field1 = fieldService.createField(field);
        URI location = URI.create("/fields/" + field1.getId());
        return ResponseEntity.created(location).body(field1);
    }

    @GetMapping
    public ResponseEntity<List<Field>> getAllfields() {
        return ResponseEntity.ok(fieldService.getAllFields());
    }
}
