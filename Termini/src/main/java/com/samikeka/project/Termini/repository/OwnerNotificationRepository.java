package com.samikeka.project.Termini.repository;

import com.samikeka.project.Termini.entity.OwnerNotification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface OwnerNotificationRepository extends JpaRepository<OwnerNotification, Long> {

    List<OwnerNotification> findByRecipient_IdOrderByCreatedAtDesc(Long recipientId);

    List<OwnerNotification> findByRecipient_IdAndReadFlagFalseOrderByCreatedAtDesc(Long recipientId);

    long countByRecipient_IdAndReadFlagFalse(Long recipientId);

    Optional<OwnerNotification> findByIdAndRecipient_Id(Long id, Long recipientId);

    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query("UPDATE OwnerNotification n SET n.readFlag = true WHERE n.recipient.id = :userId AND n.readFlag = false")
    int markAllReadForUser(@Param("userId") Long userId);

    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query("DELETE FROM OwnerNotification n WHERE n.appointment.appointmentId = :aid")
    void deleteForAppointmentId(@Param("aid") Long appointmentId);

    @Query("SELECT n FROM OwnerNotification n WHERE n.recipient.id = :uid AND n.appointment IS NOT NULL AND n.appointment.fieldLocation.id = :fid ORDER BY n.createdAt DESC")
    List<OwnerNotification> findByRecipientAndFieldId(@Param("uid") Long uid, @Param("fid") Long fid);

    @Query("SELECT n FROM OwnerNotification n WHERE n.recipient.id = :uid AND n.readFlag = false AND n.appointment IS NOT NULL AND n.appointment.fieldLocation.id = :fid ORDER BY n.createdAt DESC")
    List<OwnerNotification> findUnreadByRecipientAndFieldId(@Param("uid") Long uid, @Param("fid") Long fid);
}
