package com.samikeka.project.Termini.controller;

import com.samikeka.project.Termini.dto.FieldDto;
import com.samikeka.project.Termini.entity.ServiceOffer;
import com.samikeka.project.Termini.repository.ServiceOfferRepository;
import com.samikeka.project.Termini.entity.CountryRegion;
import com.samikeka.project.Termini.entity.ServiceCategory;
import com.samikeka.project.Termini.service.IFieldService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.net.URI;
import java.util.List;

@RestController
@RequestMapping("/api/v1/fields")
@RequiredArgsConstructor
@Tag(name = "Services", description = "Shërbimet (venues/offers) sipas vendit, kategorisë dhe qytetit")
public class FieldController {
    private final IFieldService fieldService;
    private final ServiceOfferRepository serviceOfferRepository;

    @Operation(summary = "Lista e shërbimeve (filtro me ?country=&category=&city=)")
    @GetMapping
    public ResponseEntity<List<FieldDto>> listFields(
            @RequestParam(required = false) String country,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String city) {
        CountryRegion region = null;
        if (country != null && !country.isBlank()) {
            try {
                region = CountryRegion.valueOf(country.trim().toUpperCase());
            } catch (IllegalArgumentException e) {
                throw new ResponseStatusException(
                        HttpStatus.BAD_REQUEST, "country must be KOSOVO, ALBANIA, or NORTH_MACEDONIA");
            }
        }
        ServiceCategory cat = null;
        if (category != null && !category.isBlank()) {
            try {
                cat = ServiceCategory.valueOf(category.trim().toUpperCase());
            } catch (IllegalArgumentException e) {
                throw new ResponseStatusException(
                        HttpStatus.BAD_REQUEST,
                        "category must be SPORTS, BEAUTY, HEALTH, AUTO, EDUCATION, PROFESSIONAL, or OTHER");
            }
        }
        return ResponseEntity.ok(fieldService.listFields(region, cat, city));
    }

    @Operation(summary = "Detajet e një shërbimi (publik — pa login)")
    @GetMapping("/{fieldId}")
    public ResponseEntity<FieldDto> getField(@PathVariable long fieldId) {
        return ResponseEntity.ok(fieldService.getFieldById(fieldId));
    }

    @Operation(summary = "Ofertat e shërbimit (minuta + çmim) — publik")
    @GetMapping("/{fieldId}/offers")
    public ResponseEntity<List<ServiceOffer>> offers(@PathVariable long fieldId) {
        return ResponseEntity.ok(serviceOfferRepository.findByField_IdOrderByDurationMinutesAsc(fieldId));
    }

    @Operation(summary = "Shto shërbim (vetëm llogari pronari — ROLE_FIELD_OWNER)")
    @PostMapping
    @PreAuthorize("hasAuthority('ROLE_FIELD_OWNER')")
    public ResponseEntity<FieldDto> createField(@RequestBody FieldDto fieldDto) {
        FieldDto createdFieldDto = fieldService.createField(fieldDto);
        URI location = URI.create("/api/v1/fields/" + createdFieldDto.getId());
        return ResponseEntity.created(location).body(createdFieldDto);
    }
}
