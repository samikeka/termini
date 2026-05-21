package com.samikeka.project.Termini.dto.calendar;

import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class MonthCalendarDto {
    private long fieldId;
    private int year;
    private int month;
    private List<DayCalendarDto> days;
}
