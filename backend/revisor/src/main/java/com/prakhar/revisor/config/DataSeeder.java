package com.prakhar.revisor.config;

import com.prakhar.revisor.entity.User;
import com.prakhar.revisor.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataSeeder implements ApplicationRunner {

    public static final String DEFAULT_USER_EMAIL = "default@revisor.dev";

    private final UserRepository userRepository;

    @Override
    public void run(ApplicationArguments args) {
        if (userRepository.findByEmail(DEFAULT_USER_EMAIL).isEmpty()) {
            User defaultUser = User.builder()
                    .email(DEFAULT_USER_EMAIL)
                    .username("default")
                    .build();
            userRepository.save(defaultUser);
            log.info("Default user seeded: {}", DEFAULT_USER_EMAIL);
        } else {
            log.info("Default user already exists, skipping seed.");
        }
    }
}
