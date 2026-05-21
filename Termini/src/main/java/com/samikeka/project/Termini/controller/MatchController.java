package com.samikeka.project.Termini.controller;

import com.samikeka.project.Termini.dto.JoinMatchResultDto;
import com.samikeka.project.Termini.dto.MatchParticipantBriefDto;
import com.samikeka.project.Termini.dto.OpenMatchDto;
import com.samikeka.project.Termini.dto.SeekPlayersRequestDto;
import com.samikeka.project.Termini.security.SecurityUtils;
import com.samikeka.project.Termini.service.IMatchService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/v1/matches")
@RequiredArgsConstructor
@Tag(name = "Matches", description = "Gjej lojtarë, bashkohu në ndeshje, split payment preview")
public class MatchController {

    private final IMatchService matchService;

    @Operation(summary = "Aktivizo \"Na duhen lojtarë\" (vetëm rezervuesi i terminit)")
    @PostMapping("/appointments/{appointmentId}/seek-players")
    public ResponseEntity<Void> seekPlayers(
            @PathVariable Long appointmentId,
            @RequestBody SeekPlayersRequestDto body) {
        matchService.seekPlayers(appointmentId, body, SecurityUtils.requireUserId());
        return ResponseEntity.noContent().build();
    }

    @Operation(summary = "Lista e ndeshjeve të hapura që kërkojnë lojtarë")
    @GetMapping("/open")
    public ResponseEntity<List<OpenMatchDto>> openMatches() {
        return ResponseEntity.ok(matchService.listOpenMatches());
    }

    @Operation(summary = "Lojtarët që janë bashkuar në një takim (participant list)")
    @GetMapping("/appointments/{appointmentId}/participants")
    public ResponseEntity<List<MatchParticipantBriefDto>> participants(@PathVariable Long appointmentId) {
        return ResponseEntity.ok(matchService.listParticipants(appointmentId));
    }

    @Operation(summary = "Join match — përdoruesi i kyçur")
    @PostMapping("/appointments/{appointmentId}/join")
    public ResponseEntity<JoinMatchResultDto> join(@PathVariable Long appointmentId) {
        return ResponseEntity.ok(matchService.joinMatch(appointmentId, SecurityUtils.requireUserId()));
    }

    @Operation(summary = "Parapamje split për lojtar")
    @GetMapping("/appointments/{appointmentId}/split-preview")
    public ResponseEntity<BigDecimal> splitPreview(@PathVariable Long appointmentId) {
        return ResponseEntity.ok(matchService.previewSplitPerPlayer(appointmentId));
    }
}
