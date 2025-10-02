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
        List<Appointment> byFieldLocationAndDateAppointmentAndTimeAppointment = appointmentRepository.findByFieldLocationAndDateAppointmentAndTimeAppointment(appointment.getFieldLocation(),
                appointment.getDateAppointment(), appointment.getTimeAppointment());
        LocalTime newStart = appointment.getTimeAppointment();
        LocalTime newEnd = newStart.plusHours(appointment.getTimeReservedField());
        
        //duhet me kqyr per cdo rezervim qe ekziston ne DB nese rezervimi i ri tenton te behet ne keto orare dhe brenda nje ore te refuzohen
        for (Appointment existing:byFieldLocationAndDateAppointmentAndTimeAppointment){

            LocalTime existingStart = existing.getTimeAppointment();
            LocalTime existingEnd = existingStart.plusHours(existing.getTimeReservedField());
            boolean overlap = newStart.isBefore(existingEnd) && newEnd.isAfter(existingStart);
            if(overlap){
                throw new RuntimeException("nuk mund te rezervosh ne kete kohe");
            }
        }
        return appointmentRepository.save(appointment);
    }

    @Override
    public List<Appointment> getAllAppointment() {
        return appointmentRepository.findAll();
    }
}
