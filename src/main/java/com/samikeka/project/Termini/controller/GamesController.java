package com.samikeka.project.Termini.controller;

import com.samikeka.project.Termini.dto.OpenMatchDto;
import com.samikeka.project.Termini.service.IMatchService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/** TASK 7 alias path: {@code /games/open} as specified in Termini Pro breakdown. */
@RestController
@RequestMapping("/api/v1/games")
@RequiredArgsConstructor
@Tag(name = "Games", description = "Public discovery for player-completion matches")
public class GamesController {

    private final IMatchService matchService;

    @Operation(summary = "Open games needing players (alias of /api/v1/matches/open)")
    @GetMapping("/open")
    public ResponseEntity<List<OpenMatchDto>> openGames() {
        return ResponseEntity.ok(matchService.listOpenMatches());
    }
}
