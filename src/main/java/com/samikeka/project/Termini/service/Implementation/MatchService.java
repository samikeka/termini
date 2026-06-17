package com.samikeka.project.Termini.service.Implementation;

import com.samikeka.project.Termini.dto.JoinMatchResultDto;
import com.samikeka.project.Termini.dto.MatchParticipantBriefDto;
import com.samikeka.project.Termini.dto.OpenMatchDto;
import com.samikeka.project.Termini.dto.SeekPlayersRequestDto;
import com.samikeka.project.Termini.entity.Appointment;
import com.samikeka.project.Termini.entity.MatchParticipant;
import com.samikeka.project.Termini.entity.User;
import com.samikeka.project.Termini.realtime.RealtimeNotifier;
import com.samikeka.project.Termini.repository.AppointmentRepository;
import com.samikeka.project.Termini.repository.MatchParticipantRepository;
import com.samikeka.project.Termini.repository.UserRepository;
import com.samikeka.project.Termini.service.GameRequestService;
import com.samikeka.project.Termini.service.IMatchService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;

@Service
@RequiredArgsConstructor
public class MatchService implements IMatchService {

    private final AppointmentRepository appointmentRepository;
    private final UserRepository userRepository;
    private final MatchParticipantRepository matchParticipantRepository;
    private final GameRequestService gameRequestService;
    private final RealtimeNotifier realtimeNotifier;

    @Override
    @Transactional
    public void seekPlayers(Long appointmentId, SeekPlayersRequestDto request, long organizerUserId) {
        if (request.getPlayersNeeded() < 1) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "playersNeeded must be at least 1");
        }
        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Appointment not found: " + appointmentId));
        if (appointment.getBooker() == null || !Objects.equals(appointment.getBooker().getId(), organizerUserId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only the person who booked can seek players");
        }
        User organizer = userRepository.findById(organizerUserId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Organizer user not found"));

        if (request.isSplitPaymentEnabled()) {
            if (request.getTotalFieldPrice() == null || request.getTotalFieldPrice().signum() <= 0) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "totalFieldPrice required when split payment is enabled");
            }
            if (request.getSplitAmongPlayerCount() == null || request.getSplitAmongPlayerCount() < 1) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "splitAmongPlayerCount required when split payment is enabled");
            }
        }

        appointment.setOrganizer(organizer);
        appointment.setSeekingPlayers(true);
        appointment.setPlayersNeeded(request.getPlayersNeeded());
        appointment.setTotalFieldPrice(request.getTotalFieldPrice());
        appointment.setSplitPaymentEnabled(request.isSplitPaymentEnabled());
        appointment.setSplitAmongPlayerCount(request.getSplitAmongPlayerCount());
        appointmentRepository.save(appointment);
        gameRequestService.upsertOpen(appointment, appointment.getTenantId());

        Map<String, Object> ev = new HashMap<>();
        ev.put("type", "PLAYERS_MISSING");
        ev.put("tenantId", appointment.getTenantId());
        ev.put("appointmentId", appointmentId);
        ev.put("playersNeeded", request.getPlayersNeeded());
        realtimeNotifier.publish(ev);
    }

    @Override
    @Transactional(readOnly = true)
    public List<OpenMatchDto> listOpenMatches() {
        return appointmentRepository.findBySeekingPlayersTrue().stream()
                .filter(a -> a.getPlayersNeeded() != null)
                .filter(a -> matchParticipantRepository.countByAppointment(a) < a.getPlayersNeeded())
                .map(this::toOpenMatchDto)
                .toList();
    }

    @Override
    @Transactional
    public JoinMatchResultDto joinMatch(Long appointmentId, long playerUserId) {
        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Appointment not found: " + appointmentId));
        if (!appointment.isSeekingPlayers() || appointment.getPlayersNeeded() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "This appointment is not looking for players");
        }
        long joined = matchParticipantRepository.countByAppointment(appointment);
        if (joined >= appointment.getPlayersNeeded()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "All player spots are filled");
        }
        User player = userRepository.findById(playerUserId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "User not found: " + playerUserId));
        if (appointment.getOrganizer() != null && Objects.equals(appointment.getOrganizer().getId(), player.getId())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Organizer cannot join as a filler player");
        }
        if (matchParticipantRepository.findByAppointmentAndPlayer(appointment, player).isPresent()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "User already joined this match");
        }

        BigDecimal share = computeSplitPerPlayer(appointment);
        MatchParticipant row = new MatchParticipant();
        row.setAppointment(appointment);
        row.setPlayer(player);
        row.setShareAmount(share);
        row.setJoinedAt(LocalDateTime.now());
        matchParticipantRepository.save(row);

        long newJoined = matchParticipantRepository.countByAppointment(appointment);
        JoinMatchResultDto out = new JoinMatchResultDto();
        out.setAppointmentId(appointmentId);
        out.setUserId(player.getId());
        out.setShareAmount(share);
        out.setJoinedCount(newJoined);
        out.setSpotsRemaining(Math.max(0, appointment.getPlayersNeeded() - newJoined));

        Map<String, Object> joinEv = new HashMap<>();
        joinEv.put("type", "PLAYER_JOINED");
        joinEv.put("tenantId", appointment.getTenantId());
        joinEv.put("appointmentId", appointmentId);
        joinEv.put("joinedCount", newJoined);
        joinEv.put("spotsRemaining", out.getSpotsRemaining());
        realtimeNotifier.publish(joinEv);

        if (newJoined >= appointment.getPlayersNeeded()) {
            appointment.setSeekingPlayers(false);
            appointmentRepository.save(appointment);
            gameRequestService.markFilled(appointmentId);
            Map<String, Object> full = new HashMap<>();
            full.put("type", "GAME_FULL");
            full.put("tenantId", appointment.getTenantId());
            full.put("appointmentId", appointmentId);
            realtimeNotifier.publish(full);
        }

        return out;
    }

    @Override
    @Transactional(readOnly = true)
    public BigDecimal previewSplitPerPlayer(Long appointmentId) {
        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Appointment not found: " + appointmentId));
        return computeSplitPerPlayer(appointment);
    }

    @Override
    @Transactional(readOnly = true)
    public List<MatchParticipantBriefDto> listParticipants(Long appointmentId) {
        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Appointment not found: " + appointmentId));
        return matchParticipantRepository.findByAppointmentOrderByJoinedAtAsc(appointment).stream()
                .map(p -> {
                    MatchParticipantBriefDto d = new MatchParticipantBriefDto();
                    d.setUserId(p.getPlayer().getId());
                    d.setDisplayName(p.getPlayer().getName());
                    d.setShareAmount(p.getShareAmount());
                    d.setJoinedAt(p.getJoinedAt());
                    return d;
                })
                .toList();
    }

    private OpenMatchDto toOpenMatchDto(Appointment a) {
        long joined = matchParticipantRepository.countByAppointment(a);
        int needed = a.getPlayersNeeded() != null ? a.getPlayersNeeded() : 0;
        OpenMatchDto d = new OpenMatchDto();
        d.setAppointmentId(a.getAppointmentId());
        gameRequestService.findGameRequestIdByAppointmentId(a.getAppointmentId()).ifPresent(d::setGameRequestId);
        if (a.getFieldLocation() != null) {
            d.setFieldId(a.getFieldLocation().getId());
            d.setFieldName(a.getFieldLocation().getName());
            d.setFieldCity(a.getFieldLocation().getCity());
        }
        d.setDateAppointment(a.getDateAppointment());
        d.setTimeAppointment(a.getTimeAppointment());
        d.setTimeReservedField(a.getTimeReservedField());
        d.setPlayersNeeded(needed);
        d.setJoinedCount(joined);
        d.setSpotsRemaining(Math.max(0, needed - joined));
        d.setSplitPerPlayer(computeSplitPerPlayer(a));
        return d;
    }

    private BigDecimal computeSplitPerPlayer(Appointment a) {
        if (!a.isSplitPaymentEnabled() || a.getTotalFieldPrice() == null || a.getSplitAmongPlayerCount() == null
                || a.getSplitAmongPlayerCount() < 1) {
            return null;
        }
        return a.getTotalFieldPrice().divide(BigDecimal.valueOf(a.getSplitAmongPlayerCount()), 2, RoundingMode.HALF_UP);
    }
}
