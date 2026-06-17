package com.samikeka.project.Termini;

import com.samikeka.project.Termini.dto.mapper.AppointmentMapper;
import com.samikeka.project.Termini.dto.mapper.FieldMapper;
import com.samikeka.project.Termini.dto.mapper.UserMapper;
import com.samikeka.project.Termini.realtime.RealtimeNotifier;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;

@SpringBootTest
class TerminiApplicationTests {

	@MockBean
	UserMapper userMapper;

	@MockBean
	FieldMapper fieldMapper;

	@MockBean
	AppointmentMapper appointmentMapper;

	@MockBean
	RealtimeNotifier realtimeNotifier;

	@Test
	void contextLoads() {
	}

}
