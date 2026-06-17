package com.samikeka.project.Termini.realtime;

import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.util.Map;

/** Broadcasts Termini Pro events to STOMP subscribers (TASK 10). */
@Service
@RequiredArgsConstructor
public class RealtimeNotifier {

    public static final String TOPIC_PUBLIC = "/topic/termini";

    private final SimpMessagingTemplate messagingTemplate;

    public void publish(Map<String, Object> payload) {
        messagingTemplate.convertAndSend(TOPIC_PUBLIC, payload);
    }
}
