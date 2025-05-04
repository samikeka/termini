package com.samikeka.project.Termini.service;

import com.samikeka.project.Termini.entity.Appointment;

import java.util.List;

public interface IAppointmentService {
   Appointment createAppointment(Appointment appointment);
   List<Appointment> getAllAppointment();
}
