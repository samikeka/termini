package com.samikeka.project.Termini.service.Implementation;

import com.samikeka.project.Termini.entity.Appointment;
import com.samikeka.project.Termini.repository.AppointmentRepository;
import com.samikeka.project.Termini.service.IAppointmentService;
import org.springframework.stereotype.Service;

import java.time.LocalTime;
import java.util.List;
import java.util.Optional;


@Service
public class AppointmentService implements IAppointmentService {

    private final AppointmentRepository appointmentRepository;

    public AppointmentService(AppointmentRepository appointmentRepository) {
        this.appointmentRepository = appointmentRepository;
    }

    @Override
    public Appointment createAppointment(Appointment appointment) {
        Appointment oldAppointment = appointmentRepository.findByTimeAppointment(appointment.getTimeAppointment());
        if (oldAppointment==null){
            return appointmentRepository.save(appointment);
        }

       throw new RuntimeException("Nuk mund te besh booking per kete rezervim sepse eshte bere tashme");
    }

    @Override
    public List<Appointment> getAllAppointment() {
        return appointmentRepository.findAll();
    }
}
