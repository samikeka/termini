package com.samikeka.project.Termini.repository;

import com.samikeka.project.Termini.entity.CountryRegion;
import com.samikeka.project.Termini.entity.Field;
import com.samikeka.project.Termini.entity.ServiceCategory;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface FieldRepository extends JpaRepository<Field, Long> {

    List<Field> findByCountry(CountryRegion country);

    List<Field> findByCountryAndCityContainingIgnoreCase(CountryRegion country, String city);

    List<Field> findByCityContainingIgnoreCase(String city);

    List<Field> findByCategory(ServiceCategory category);

    List<Field> findByCategoryAndCityContainingIgnoreCase(ServiceCategory category, String city);

    List<Field> findByCountryAndCategory(CountryRegion country, ServiceCategory category);

    List<Field> findByCountryAndCategoryAndCityContainingIgnoreCase(
            CountryRegion country,
            ServiceCategory category,
            String city);

    List<Field> findByFieldOwner_IdOrderByNameAsc(Long ownerId);
}

