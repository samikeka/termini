package com.samikeka.project.Termini.controller;

import com.samikeka.project.Termini.dto.PlayerStatsPatchDto;
import com.samikeka.project.Termini.dto.UserDto;
import com.samikeka.project.Termini.security.SecurityUtils;
import com.samikeka.project.Termini.service.IUserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequestMapping("/api/v1/users")
@RequiredArgsConstructor
@Tag(name = "Users", description = "Përdoruesit, leaderboard, statistika lojtari")
public class UserController {
    private final IUserService userService;

    @Operation(summary = "Leaderboard — renditur sipas golave, asistimeve, MVP")
    @GetMapping("/leaderboard")
    public ResponseEntity<List<UserDto>> leaderboard(@RequestParam(defaultValue = "20") int limit) {
        return ResponseEntity.ok(userService.getLeaderboard(limit));
    }

    @Operation(summary = "Përditëso statistikat e lojtarit (delta pas një ndeshjeje)")
    @PatchMapping("/{id}/stats")
    public ResponseEntity<UserDto> patchStats(@PathVariable Long id, @RequestBody PlayerStatsPatchDto body) {
        if (!id.equals(SecurityUtils.requireUserId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You can only update your own stats");
        }
        return ResponseEntity.ok(userService.patchPlayerStats(id, body));
    }

}
