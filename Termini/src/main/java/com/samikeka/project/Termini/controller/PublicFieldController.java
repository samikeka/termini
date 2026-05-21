package com.samikeka.project.Termini.controller;

import com.samikeka.project.Termini.dto.calendar.MonthCalendarDto;
import com.samikeka.project.Termini.service.FieldCalendarService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/public/fields")
@RequiredArgsConstructor
@Tag(name = "Public fields", description = "Kalendari i lirë / zënë pa login")
public class PublicFieldController {

    private final FieldCalendarService fieldCalendarService;

    @Operation(summary = "Kalendari mujor (çdo ditë: orët 8–22, busy/free)")
    @GetMapping("/{fieldId}/calendar/month")
    public ResponseEntity<MonthCalendarDto> monthCalendar(
            @PathVariable long fieldId,
            @RequestParam int year,
            @RequestParam int month) {
        return ResponseEntity.ok(fieldCalendarService.monthCalendar(fieldId, year, month));
    }
}
