package com.samikeka.project.Termini.service.booking;

import com.samikeka.project.Termini.entity.Appointment;
import com.samikeka.project.Termini.entity.Field;
import com.samikeka.project.Termini.entity.ServiceCategory;
import com.samikeka.project.Termini.entity.ServiceOffer;
import com.samikeka.project.Termini.repository.ServiceOfferRepository;

import java.util.List;

/**
 * Për fusha SPORTS me rrjetë 30 min: nëse në DB mbetet {@code durationMinutes} më i vogël se seanca minimale
 * e shitur (oferta më e shkurtër / default), kalendari dhe kontrolli i konfliktit përdorin
 * {@code max( e ruajtur , minimumi komercial )} që të mos hapet “dritare” e rreme midis dy gjysmëorëve.
 */
public final class SportsOccupancy {

    private SportsOccupancy() {
    }

    public static int baseDurationMinutes(Appointment a) {
        if (a.getDurationMinutes() != null && a.getDurationMinutes() > 0) {
            return a.getDurationMinutes();
        }
        return Math.max(15, (a.getTimeReservedField() == null ? 1 : a.getTimeReservedField().intValue()) * 60);
    }

    public static int effectiveDurationMinutes(Appointment a, Integer sportsMinSessionMinutes) {
        int base = baseDurationMinutes(a);
        if (sportsMinSessionMinutes == null || sportsMinSessionMinutes <= 0) {
            return base;
        }
        return Math.max(base, sportsMinSessionMinutes);
    }

    /**
     * @return null kur kategoria nuk është SPORTS; përndryshe minuta (≥15)
     */
    public static Integer sportsMinSessionMinutes(Field field, ServiceOfferRepository serviceOfferRepository) {
        if (field.getCategory() != ServiceCategory.SPORTS) {
            return null;
        }
        List<ServiceOffer> offers = serviceOfferRepository.findByField_IdOrderByDurationMinutesAsc(field.getId());
        if (!offers.isEmpty()) {
            int m = offers.get(0).getDurationMinutes();
            return m >= 15 ? m : 60;
        }
        Integer def = field.getDefaultDurationMinutes();
        return def != null && def >= 15 ? def : 60;
    }
}
