package com.samikeka.project.Termini.service;

import com.samikeka.project.Termini.dto.OwnerNotificationDto;
import com.samikeka.project.Termini.entity.Appointment;
import com.samikeka.project.Termini.entity.Field;
import com.samikeka.project.Termini.entity.OwnerNotification;
import com.samikeka.project.Termini.entity.OwnerNotificationType;
import com.samikeka.project.Termini.entity.User;
import com.samikeka.project.Termini.repository.OwnerNotificationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
@RequiredArgsConstructor
public class OwnerNotificationService {

    private final OwnerNotificationRepository ownerNotificationRepository;

    @Transactional
    public void notifyNewBooking(Appointment saved) {
        Field field = saved.getFieldLocation();
        if (field == null) {
            return;
        }
        User owner = field.getFieldOwner();
        if (owner == null) {
            return;
        }
        User booker = saved.getBooker();
        String clientName;
        String clientEmail;
        if (booker != null) {
            clientName = booker.getName();
            clientEmail = booker.getEmail();
        } else {
            clientName = saved.getGuestName() != null ? saved.getGuestName() : "?";
            clientEmail = saved.getGuestEmail() != null ? saved.getGuestEmail() : "?";
        }
        String msg = String.format(
                "Rezervim i ri në \"%s\": %s %s. Klienti: %s (%s).",
                field.getName(),
                saved.getDateAppointment(),
                saved.getTimeAppointment(),
                clientName,
                clientEmail);

        OwnerNotification n = new OwnerNotification();
        n.setRecipient(owner);
        n.setAppointment(saved);
        n.setType(OwnerNotificationType.NEW_BOOKING);
        n.setMessage(msg);
        n.setReadFlag(false);
        ownerNotificationRepository.save(n);
    }

    @Transactional(readOnly = true)
    public List<OwnerNotificationDto> listForRecipientAndField(long userId, long fieldId, boolean unreadOnly) {
        List<OwnerNotification> rows = unreadOnly
                ? ownerNotificationRepository.findUnreadByRecipientAndFieldId(userId, fieldId)
                : ownerNotificationRepository.findByRecipientAndFieldId(userId, fieldId);
        return rows.stream().map(this::toDto).toList();
    }

    @Transactional(readOnly = true)
    public List<OwnerNotificationDto> listForRecipient(long userId, boolean unreadOnly) {
        List<OwnerNotification> rows = unreadOnly
                ? ownerNotificationRepository.findByRecipient_IdAndReadFlagFalseOrderByCreatedAtDesc(userId)
                : ownerNotificationRepository.findByRecipient_IdOrderByCreatedAtDesc(userId);
        return rows.stream().map(this::toDto).toList();
    }

    @Transactional(readOnly = true)
    public long countUnread(long userId) {
        return ownerNotificationRepository.countByRecipient_IdAndReadFlagFalse(userId);
    }

    @Transactional
    public void markRead(long userId, long notificationId) {
        OwnerNotification n = ownerNotificationRepository.findByIdAndRecipient_Id(notificationId, userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Notification not found"));
        n.setReadFlag(true);
        ownerNotificationRepository.save(n);
    }

    @Transactional
    public int markAllRead(long userId) {
        return ownerNotificationRepository.markAllReadForUser(userId);
    }

    @Transactional
    public void deleteForAppointment(long appointmentId) {
        ownerNotificationRepository.deleteForAppointmentId(appointmentId);
    }

    private OwnerNotificationDto toDto(OwnerNotification n) {
        OwnerNotificationDto d = new OwnerNotificationDto();
        d.setId(n.getId());
        d.setAppointmentId(n.getAppointment() != null ? n.getAppointment().getAppointmentId() : null);
        d.setType(n.getType() != null ? n.getType().name() : null);
        d.setMessage(n.getMessage());
        d.setRead(n.isReadFlag());
        d.setCreatedAt(n.getCreatedAt());
        return d;
    }
}
