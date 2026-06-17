package com.samikeka.project.Termini;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class TerminiApplication {

	public static void main(String[] args) {
		SpringApplication.run(TerminiApplication.class, args);
	}

}
