package com.disasterrelief;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class DisasterReliefApplication {
    public static void main(String[] args) {
        SpringApplication.run(DisasterReliefApplication.class, args);
    }
}
