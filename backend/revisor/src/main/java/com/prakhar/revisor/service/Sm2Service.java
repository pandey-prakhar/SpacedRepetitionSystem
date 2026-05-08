package com.prakhar.revisor.service;

import com.prakhar.revisor.entity.Problem;
import com.prakhar.revisor.enums.Rating;
import org.springframework.stereotype.Service;
import java.time.LocalDate;

@Service
public class Sm2Service {

    private static final double MIN_EASE_FACTOR = 1.3;

    public void apply(Problem problem, Rating rating) {
        double ef = problem.getEaseFactor();
        int interval = problem.getIntervalDays();
        int reps = problem.getRepetitions();

        switch (rating) {
            case AGAIN -> {
                ef = Math.max(MIN_EASE_FACTOR, ef - 0.20);
                interval = 1;
                reps = 0;
            }
            case HARD -> {
                ef = Math.max(MIN_EASE_FACTOR, ef - 0.15);
                interval = Math.max(1, (int) Math.round(interval * 1.2));
                reps = reps + 1;
            }
            case GOOD -> {
                if (reps == 0)      interval = 1;
                else if (reps == 1) interval = 3;
                else                interval = (int) Math.round(interval * ef);
                reps = reps + 1;
            }
            case EASY -> {
                interval = (int) Math.round(interval * ef * 1.3);
                ef = ef + 0.15;
                reps = reps + 1;
            }
        }

        problem.setEaseFactor(ef);
        problem.setIntervalDays(interval);
        problem.setRepetitions(reps);
        problem.setNextReviewDate(LocalDate.now().plusDays(interval));
    }
}
