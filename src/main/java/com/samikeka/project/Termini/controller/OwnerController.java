package com.samikeka.project.Termini.controller;

import com.samikeka.project.Termini.dto.AppointmentDto;
import com.samikeka.project.Termini.dto.FieldDto;
import com.samikeka.project.Termini.dto.OwnerNotificationDto;
import com.samikeka.project.Termini.dto.OwnerPayoutProfileDto;
import com.samikeka.project.Termini.dto.UserDto;
import com.samikeka.project.Termini.security.SecurityUtils;
import com.samikeka.project.Termini.service.IAppointmentService;
import com.samikeka.project.Termini.service.IFieldService;
import com.samikeka.project.Termini.service.OwnerNotificationService;
import com.samikeka.project.Termini.service.OwnerProfileService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/owner")
@RequiredArgsConstructor
@PreAuthorize("hasAuthority('ROLE_FIELD_OWNER')")
@Tag(name = "Owner", description = "Paneli i pronarit të fushës — terminet & njoftimet")
public class OwnerController {

    private final IAppointmentService appointmentService;
    private final IFieldService fieldService;
    private final OwnerNotificationService ownerNotificationService;
    private final OwnerProfileService ownerProfileService;

    @Operation(summary = "Profili i pagesës (IBAN / titullar) për transfertat te pronari")
    @GetMapping("/payout-profile")
    public ResponseEntity<OwnerPayoutProfileDto> payoutProfile() {
        long userId = SecurityUtils.requireUserId();
        return ResponseEntity.ok(ownerProfileService.getPayoutProfile(userId));
    }

    @Operation(summary = "Përditëso IBAN dhe titullarin e llogarisë së pronarit")
    @PatchMapping("/payout-profile")
    public ResponseEntity<UserDto> updatePayoutProfile(@RequestBody OwnerPayoutProfileDto body) {
        long userId = SecurityUtils.requireUserId();
        return ResponseEntity.ok(ownerProfileService.updatePayoutProfile(userId, body));
    }

    @Operation(summary = "Fushat që i menaxhon pronari (zgjidh një për panel)")
    @GetMapping("/fields")
    public ResponseEntity<List<FieldDto>> myFields() {
        long userId = SecurityUtils.requireUserId();
        return ResponseEntity.ok(fieldService.listFieldsOwnedBy(userId));
    }

    @Operation(summary = "Terminet vetëm për një fushë tënde")
    @GetMapping("/fields/{fieldId}/appointments")
    public ResponseEntity<List<AppointmentDto>> appointmentsForField(@PathVariable long fieldId) {
        long userId = SecurityUtils.requireUserId();
        return ResponseEntity.ok(appointmentService.getAppointmentsForOwnerField(userId, fieldId));
    }

    @Operation(summary = "Njoftime vetëm për një fushë tënde")
    @GetMapping("/fields/{fieldId}/notifications")
    public ResponseEntity<List<OwnerNotificationDto>> notificationsForField(
            @PathVariable long fieldId,
            @RequestParam(defaultValue = "false") boolean unreadOnly) {
        long userId = SecurityUtils.requireUserId();
        return ResponseEntity.ok(ownerNotificationService.listForRecipientAndField(userId, fieldId, unreadOnly));
    }

    @Operation(summary = "Të gjitha terminet në të gjitha fushat e tua (pamje e përgjithshme)")
    @GetMapping("/appointments")
    public ResponseEntity<List<AppointmentDto>> myAppointments() {
        long userId = SecurityUtils.requireUserId();
        return ResponseEntity.ok(appointmentService.getAllAppointmentsOfOwnerById(userId));
    }

    @Operation(summary = "Anulo një rezervim (vetëm nëse fusha është e jote)")
    @DeleteMapping("/appointments/{appointmentId}")
    public ResponseEntity<Void> cancelAppointment(@PathVariable long appointmentId) {
        appointmentService.cancelAppointmentAsOwner(SecurityUtils.requireUserId(), appointmentId);
        return ResponseEntity.noContent().build();
    }

    @Operation(summary = "Lista e njoftimeve (rezervime të reja, etj.)")
    @GetMapping("/notifications")
    public ResponseEntity<List<OwnerNotificationDto>> notifications(
            @RequestParam(defaultValue = "false") boolean unreadOnly) {
        long userId = SecurityUtils.requireUserId();
        return ResponseEntity.ok(ownerNotificationService.listForRecipient(userId, unreadOnly));
    }

    @Operation(summary = "Numri i njoftimeve të palexuara (për badge)")
    @GetMapping("/notifications/unread-count")
    public ResponseEntity<Map<String, Long>> unreadCount() {
        long userId = SecurityUtils.requireUserId();
        return ResponseEntity.ok(Map.of("count", ownerNotificationService.countUnread(userId)));
    }

    @Operation(summary = "Shëno një njoftim si të lexuar")
    @PatchMapping("/notifications/{id}/read")
    public ResponseEntity<Void> markNotificationRead(@PathVariable long id) {
        ownerNotificationService.markRead(SecurityUtils.requireUserId(), id);
        return ResponseEntity.noContent().build();
    }

    @Operation(summary = "Shëno të gjitha njoftimet si të lexuara")
    @PostMapping("/notifications/read-all")
    public ResponseEntity<Map<String, Integer>> markAllNotificationsRead() {
        int updated = ownerNotificationService.markAllRead(SecurityUtils.requireUserId());
        return ResponseEntity.ok(Map.of("updated", updated));
    }
}
