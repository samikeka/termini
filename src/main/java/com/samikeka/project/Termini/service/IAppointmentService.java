package com.samikeka.project.Termini.service;

import com.samikeka.project.Termini.dto.AppointmentDto;
import com.samikeka.project.Termini.dto.CreateBookingRequest;
import com.samikeka.project.Termini.entity.Appointment;

import java.util.List;

public interface IAppointmentService {
    Appointment createBooking(CreateBookingRequest request);

    /** Used by jobs (recurring expansion) acting on behalf of a concrete user — bypasses JWT. */
    Appointment createBookingForUser(long bookerUserId, CreateBookingRequest request);

    List<Appointment> getAllAppointment();

    List<Appointment> getAppointmentsByFieldId(Long fieldId);

    List<Appointment> getMyAppointmentsForField(Long fieldId, Long userId);

    List<AppointmentDto> getAllAppointmentsOfOwnerById(Long id);

    List<AppointmentDto> getAppointmentsForOwnerField(long ownerUserId, long fieldId);

    void cancelAppointmentAsOwner(long ownerUserId, long appointmentId);
}
