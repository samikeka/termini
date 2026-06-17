package com.samikeka.project.Termini.config;

import io.swagger.v3.oas.models.ExternalDocumentation;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class SwaggerConfig {

    @Bean
    public OpenAPI terminiOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("Termini Booking API")
                        .description("Platformë për rezervimin dhe menaxhimin e fushave sportive dhe shërbimeve")
                        .version("1.0.0")
                        .contact(new Contact()
                                .name("Sami Keka")
                                .email("support@termini.com")
                                .url("https://termini.com"))
                        .license(new License()
                                .name("Apache 2.0")
                                .url("https://springdoc.org")))
                .externalDocs(new ExternalDocumentation()
                        .description("Dokumentacioni i plotë i Termini")
                        .url("https://termini.com/docs"));
    }
}
