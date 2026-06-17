package com.samikeka.project.Termini.bootstrap;

import com.samikeka.project.Termini.entity.CountryRegion;
import com.samikeka.project.Termini.entity.Field;
import com.samikeka.project.Termini.entity.ServiceCategory;
import com.samikeka.project.Termini.entity.User;
import com.samikeka.project.Termini.entity.UserRole;
import com.samikeka.project.Termini.repository.FieldRepository;
import com.samikeka.project.Termini.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * Fusha sportive outdoor publike në Kosovë — pa pagesë, pa rezervim online;
 * vetëm lokacion dhe foto për zbulim.
 */
@Component
@Order(105)
@Slf4j
@RequiredArgsConstructor
public class KosovoOutdoorFieldsSeeder implements CommandLineRunner {

    public static final String FIELD_NAME_PREFIX = "Fushë publike outdoor — ";

    private final UserRepository userRepository;
    private final FieldRepository fieldRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${termini.demo-data.seed:true}")
    private boolean seedEnabled;

    @Value("${termini.demo-data.seed-kosovo-outdoor:true}")
    private boolean seedKosovoOutdoor;

    private record OutdoorSpot(String city, String location, String areaLabel) {}

    private static final String[] OUTDOOR_COVER_IMAGES = {
            "https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=1200&q=80",
            "https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?auto=format&fit=crop&w=1200&q=80",
            "https://images.unsplash.com/photo-1529900748604-07564a03e7a9?auto=format&fit=crop&w=1200&q=80",
            "https://images.unsplash.com/photo-1459865264687-595d652de67e?auto=format&fit=crop&w=1200&q=80",
            "https://images.unsplash.com/photo-1517466787929-bc90951f0987?auto=format&fit=crop&w=1200&q=80",
            "https://images.unsplash.com/photo-1551958219-acbc608c7377?auto=format&fit=crop&w=1200&q=80"
    };

    private static final List<OutdoorSpot> KOSOVO_OUTDOOR = List.of(
            new OutdoorSpot("Prishtinë", "Parku i Germisë, zona sportive", "Germia"),
            new OutdoorSpot("Prishtinë", "Aktivi i Prishtinës, fusha sintetike", "Aktivi"),
            new OutdoorSpot("Prishtinë", "Kodra e Diellit, fushë 5v5", "Kodra e Diellit"),
            new OutdoorSpot("Prizren", "Llugaxhi, pranë lumit", "Llugaxhi"),
            new OutdoorSpot("Prizren", "Zona e Kalasë, fushë komunitare", "Kalaja"),
            new OutdoorSpot("Pejë", "Karagaq, fushë publike", "Karagaq"),
            new OutdoorSpot("Pejë", "Bogë, zonë rekreative", "Bogë"),
            new OutdoorSpot("Gjakovë", "Çabrati, fushë komunitare", "Çabrati"),
            new OutdoorSpot("Gjakovë", "Qendra sportive, fushë outdoor", "Qendra"),
            new OutdoorSpot("Ferizaj", "Varosh, fushë publike", "Varosh"),
            new OutdoorSpot("Ferizaj", "Livoc, zonë sportive", "Livoc"),
            new OutdoorSpot("Gjilan", "Koretinë, fushë sintetike", "Koretinë"),
            new OutdoorSpot("Gjilan", "Bregu i Diellit", "Bregu i Diellit"),
            new OutdoorSpot("Mitrovicë", "Shipol, fushë komunitare", "Shipol"),
            new OutdoorSpot("Mitrovicë", "Kodra e Minatorëve", "Minatorët"),
            new OutdoorSpot("Podujevë", "Lluzhan, fushë publike", "Lluzhan"),
            new OutdoorSpot("Vushtrri", "Bajgora, zonë sportive", "Bajgora"),
            new OutdoorSpot("Suharekë", "Mushtisht, fushë komunitare", "Mushtisht"),
            new OutdoorSpot("Rahovec", "Zatriq, fushë publike", "Zatriq"),
            new OutdoorSpot("Malishevë", "Koretinë e Madhe", "Koretinë"),
            new OutdoorSpot("Lipjan", "Magurë, fushë komunitare", "Magurë"),
            new OutdoorSpot("Kamenicë", "Budriga, zonë sportive", "Budriga"),
            new OutdoorSpot("Skenderaj", "Llaushë, fushë publike", "Llaushë"),
            new OutdoorSpot("Deçan", "Baballoq, fushë komunitare", "Baballoq"),
            new OutdoorSpot("Istog", "Gorazhdec, zonë sportive", "Gorazhdec"),
            new OutdoorSpot("Klinë", "Budinar, fushë publike", "Budinar"),
            new OutdoorSpot("Kaçanik", "Kaqanik, fushë komunitare", "Qendra"),
            new OutdoorSpot("Obiliq", "Obiliq, fushë publike", "Obiliq"),
            new OutdoorSpot("Fushë Kosovë", "Hogosht, zonë sportive", "Hogosht"),
            new OutdoorSpot("Shtime", "Shtime, fushë komunitare", "Shtime"),
            new OutdoorSpot("Drenas", "Korroticë, fushë publike", "Korroticë"),
            new OutdoorSpot("Junik", "Junik, zonë sportive", "Junik"),
            new OutdoorSpot("Dragash", "Brod, fushë komunitare", "Brod")
    );

    @Override
    @Transactional
    public void run(String... args) {
        if (!seedEnabled || !seedKosovoOutdoor) {
            return;
        }

        upsertOutdoorHost();
        List<Field> existing = fieldRepository.findByCountry(CountryRegion.KOSOVO);
        int created = 0;
        int imageIdx = 0;

        for (OutdoorSpot spot : KOSOVO_OUTDOOR) {
            String name = FIELD_NAME_PREFIX + spot.areaLabel() + " (" + spot.city() + ")";
            boolean already = existing.stream().anyMatch(f ->
                    f.getName() != null
                            && f.getName().equalsIgnoreCase(name)
                            && f.getCity() != null
                            && f.getCity().equalsIgnoreCase(spot.city()));
            if (already) {
                continue;
            }
            Field f = new Field();
            f.setName(name);
            f.setLocation(spot.location());
            f.setCity(spot.city());
            f.setCountry(CountryRegion.KOSOVO);
            f.setCategory(ServiceCategory.SPORTS);
            f.setDefaultDurationMinutes(60);
            f.setHourlyPriceEur(null);
            f.setFieldOwner(null);
            f.setTenantId(null);
            f.setSlotCalendarMinutes(30);
            f.setCoverImageUrl(coverImageAt(imageIdx++));
            fieldRepository.save(f);
            existing.add(f);
            created++;
        }

        int photosPatched = 0;
        for (Field f : existing) {
            if (f.getName() == null || !f.getName().startsWith(FIELD_NAME_PREFIX)) {
                continue;
            }
            if (f.getCoverImageUrl() != null && !f.getCoverImageUrl().isBlank()) {
                continue;
            }
            f.setCoverImageUrl(coverImageAt(imageIdx++));
            f.setFieldOwner(null);
            f.setTenantId(null);
            fieldRepository.save(f);
            photosPatched++;
        }

        if (created > 0 || photosPatched > 0) {
            log.info(
                    "KosovoOutdoorFieldsSeeder: {} fusha të reja, {} foto/lokacion të përditësuara (pa rezervim).",
                    created,
                    photosPatched);
        }
    }

    private static String coverImageAt(int index) {
        return OUTDOOR_COVER_IMAGES[Math.floorMod(index, OUTDOOR_COVER_IMAGES.length)];
    }

    private User upsertOutdoorHost() {
        String email = "outdoor-ks@termini.demo";
        User u = userRepository.findByEmailIgnoreCase(email).orElseGet(User::new);
        u.setName("Fusha Publike KS");
        u.setCity("Prishtinë");
        u.setEmail(email);
        u.setRole(UserRole.FIELD_OWNER);
        u.setOwnerIban("XK00000000000000000000000000");
        u.setOwnerAccountHolder("Komuna / komunitet (demo)");
        String plain = "terminiowner123";
        String h = u.getPasswordHash();
        if (h == null || h.isBlank() || !passwordEncoder.matches(plain, h)) {
            u.setPasswordHash(passwordEncoder.encode(plain));
        }
        return userRepository.save(u);
    }
}
