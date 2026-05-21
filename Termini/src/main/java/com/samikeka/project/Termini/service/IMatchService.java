package com.samikeka.project.Termini.service;

import com.samikeka.project.Termini.dto.JoinMatchResultDto;
import com.samikeka.project.Termini.dto.MatchParticipantBriefDto;
import com.samikeka.project.Termini.dto.OpenMatchDto;
import com.samikeka.project.Termini.dto.SeekPlayersRequestDto;

import java.math.BigDecimal;
import java.util.List;

public interface IMatchService {

    void seekPlayers(Long appointmentId, SeekPlayersRequestDto request, long organizerUserId);

    List<OpenMatchDto> listOpenMatches();

    JoinMatchResultDto joinMatch(Long appointmentId, long playerUserId);

    BigDecimal previewSplitPerPlayer(Long appointmentId);

    List<MatchParticipantBriefDto> listParticipants(Long appointmentId);
}
