package com.samikeka.project.Termini.bootstrap;

import com.samikeka.project.Termini.entity.User;
import com.samikeka.project.Termini.entity.UserRole;
import com.samikeka.project.Termini.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

/**
 * Përditëson llogarinë demo të pronarit edhe kur fushat ekzistojnë tashmë (pa ri-seed).
 */
@Component
@Order(150)
@RequiredArgsConstructor
public class DemoOwnerRoleFix implements CommandLineRunner {

    private final UserRepository userRepository;

    @Override
    @Transactional
    public void run(String... args) {
        userRepository.findByEmailIgnoreCase("owner@termini.demo").ifPresent(u -> normalizeDemoOwner(u,
                "XK05123456789012345678901234", "Pronar Demo"));
        userRepository.findByEmailIgnoreCase("owner2@termini.demo").ifPresent(u -> normalizeDemoOwner(u,
                "AL05123456789012345678901234", "Pronar 2"));
        userRepository.findByEmailIgnoreCase("owner3@termini.demo").ifPresent(u -> normalizeDemoOwner(u,
                "MK05123456789012345678901234", "Pronar 3"));
    }

    private void normalizeDemoOwner(User u, String iban, String holder) {
        boolean dirty = false;
        if (u.getRole() != UserRole.FIELD_OWNER) {
            u.setRole(UserRole.FIELD_OWNER);
            dirty = true;
        }
        if (u.getOwnerIban() == null || u.getOwnerIban().isBlank()) {
            u.setOwnerIban(iban);
            u.setOwnerAccountHolder(holder);
            dirty = true;
        }
        if (dirty) {
            userRepository.save(u);
        }
    }
}
