package com.samikeka.project.Termini.schedule;

import com.samikeka.project.Termini.service.RecurringBookingService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class RecurringBookingScheduler {

    private final RecurringBookingService recurringBookingService;

    @Scheduled(fixedDelayString = "${termini.recurring.poll-ms:3600000}")
    public void expandRecurringTemplates() {
        log.trace("Scheduler: recurring booking expansion tick");
        recurringBookingService.expandDueInstances();
    }
}
