package com.samikeka.project.Termini.service.Implementation;

import com.samikeka.project.Termini.entity.Appointment;
import com.samikeka.project.Termini.repository.AppointmentRepository;
import com.samikeka.project.Termini.service.IAppointmentService;
import org.springframework.stereotype.Service;

import java.util.List;


@Service
public class AppointmentService implements IAppointmentService {

    private final AppointmentRepository appointmentRepository;

    public AppointmentService(AppointmentRepository appointmentRepository) {
        this.appointmentRepository = appointmentRepository;
    }

    @Override
    public Appointment createAppointment(Appointment appointment) {
        return appointmentRepository.save(appointment);
    }

    @Override
    public List<Appointment> getAllAppointment() {
        return appointmentRepository.findAll();
    }
}
