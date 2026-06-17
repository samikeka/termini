package com.samikeka.project.Termini.dto.calendar;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;
import java.util.List;

@Getter
@Setter
public class DayCalendarDto {
    private LocalDate date;
    private List<SlotDto> slots;
}
