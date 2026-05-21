package com.samikeka.project.Termini.config;

import org.springframework.dao.OptimisticLockingFailureException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.orm.ObjectOptimisticLockingFailureException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.server.ResponseStatusException;

import java.util.Map;

@RestControllerAdvice
public class GlobalRestExceptionHandler {

    @ExceptionHandler(ResponseStatusException.class)
    public ResponseEntity<Map<String, Object>> onResponseStatus(ResponseStatusException ex) {
        HttpStatus status = HttpStatus.valueOf(ex.getStatusCode().value());
        return ResponseEntity.status(status)
                .body(Map.of(
                        "status", status.value(),
                        "error", status.getReasonPhrase(),
                        "message", ex.getReason() != null ? ex.getReason() : status.getReasonPhrase()));
    }

    @ExceptionHandler({OptimisticLockingFailureException.class, ObjectOptimisticLockingFailureException.class})
    public ResponseEntity<Map<String, String>> onOptimisticLock(Exception ex) {
        return ResponseEntity.status(HttpStatus.CONFLICT)
                .body(Map.of(
                        "error", "Concurrency conflict — another booking raced this slot.",
                        "detail", ex.getMessage() != null ? ex.getMessage() : ""));
    }
}
