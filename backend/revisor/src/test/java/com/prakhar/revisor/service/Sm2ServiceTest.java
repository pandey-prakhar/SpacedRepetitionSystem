package com.prakhar.revisor.service;

import com.prakhar.revisor.entity.Problem;
import com.prakhar.revisor.enums.Rating;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import java.time.LocalDate;
import static org.assertj.core.api.Assertions.assertThat;

class Sm2ServiceTest {

    private Sm2Service sm2;
    private Problem problem;

    @BeforeEach
    void setUp() {
        sm2 = new Sm2Service();
        problem = Problem.builder()
                .easeFactor(2.5)
                .intervalDays(1)
                .repetitions(0)
                .nextReviewDate(LocalDate.now())
                .build();
    }

    // ---------- AGAIN ----------

    @Test
    @DisplayName("AGAIN resets interval to 1 and repetitions to 0")
    void again_resetsProgress() {
        problem.setIntervalDays(40);
        problem.setRepetitions(5);

        sm2.apply(problem, Rating.AGAIN);

        assertThat(problem.getIntervalDays()).isEqualTo(1);
        assertThat(problem.getRepetitions()).isZero();
        assertThat(problem.getNextReviewDate()).isEqualTo(LocalDate.now().plusDays(1));
    }

    @Test
    @DisplayName("AGAIN decreases ease factor by 0.20")
    void again_decreasesEaseFactor() {
        problem.setEaseFactor(2.5);

        sm2.apply(problem, Rating.AGAIN);

        assertThat(problem.getEaseFactor()).isEqualTo(2.30, org.assertj.core.data.Offset.offset(1e-9));
    }

    @Test
    @DisplayName("AGAIN does not let ease factor drop below 1.3")
    void again_floorsEaseFactor() {
        problem.setEaseFactor(1.35);

        sm2.apply(problem, Rating.AGAIN);

        assertThat(problem.getEaseFactor()).isEqualTo(1.3);
    }

    // ---------- HARD ----------

    @Test
    @DisplayName("HARD multiplies interval by 1.2 and rounds")
    void hard_growsIntervalSlowly() {
        problem.setIntervalDays(10);
        problem.setRepetitions(3);

        sm2.apply(problem, Rating.HARD);

        assertThat(problem.getIntervalDays()).isEqualTo(12); // 10 * 1.2
        assertThat(problem.getRepetitions()).isEqualTo(4);
        assertThat(problem.getNextReviewDate()).isEqualTo(LocalDate.now().plusDays(12));
    }

    @Test
    @DisplayName("HARD never lets interval drop below 1")
    void hard_keepsIntervalAtLeastOne() {
        problem.setIntervalDays(0);

        sm2.apply(problem, Rating.HARD);

        assertThat(problem.getIntervalDays()).isGreaterThanOrEqualTo(1);
    }

    @Test
    @DisplayName("HARD decreases ease factor by 0.15 with floor at 1.3")
    void hard_decreasesEaseFactorWithFloor() {
        problem.setEaseFactor(1.4);

        sm2.apply(problem, Rating.HARD);

        assertThat(problem.getEaseFactor()).isEqualTo(1.3);
    }

    // ---------- GOOD ----------

    @Test
    @DisplayName("GOOD on first repetition (reps=0) sets interval to 1 day")
    void good_firstRepIsOneDay() {
        problem.setRepetitions(0);
        problem.setIntervalDays(99); // ignored when reps=0

        sm2.apply(problem, Rating.GOOD);

        assertThat(problem.getIntervalDays()).isEqualTo(1);
        assertThat(problem.getRepetitions()).isEqualTo(1);
    }

    @Test
    @DisplayName("GOOD on second repetition (reps=1) sets interval to 3 days")
    void good_secondRepIsThreeDays() {
        problem.setRepetitions(1);
        problem.setIntervalDays(99);

        sm2.apply(problem, Rating.GOOD);

        assertThat(problem.getIntervalDays()).isEqualTo(3);
        assertThat(problem.getRepetitions()).isEqualTo(2);
    }

    @Test
    @DisplayName("GOOD beyond second rep multiplies interval by ease factor")
    void good_thirdRepUsesEaseFactor() {
        problem.setRepetitions(2);
        problem.setIntervalDays(6);
        problem.setEaseFactor(2.5);

        sm2.apply(problem, Rating.GOOD);

        assertThat(problem.getIntervalDays()).isEqualTo(15); // 6 * 2.5
    }

    @Test
    @DisplayName("GOOD does not change ease factor")
    void good_easeFactorUnchanged() {
        problem.setEaseFactor(2.5);

        sm2.apply(problem, Rating.GOOD);

        assertThat(problem.getEaseFactor()).isEqualTo(2.5);
    }

    // ---------- EASY ----------

    @Test
    @DisplayName("EASY multiplies interval by ease factor and 1.3 bonus")
    void easy_appliesBonusMultiplier() {
        problem.setIntervalDays(6);
        problem.setEaseFactor(2.5);
        problem.setRepetitions(2);

        sm2.apply(problem, Rating.EASY);

        // 6 * 2.5 * 1.3 = 19.5 → rounds to 20
        assertThat(problem.getIntervalDays()).isEqualTo(20);
        assertThat(problem.getRepetitions()).isEqualTo(3);
    }

    @Test
    @DisplayName("EASY increases ease factor by 0.15")
    void easy_increasesEaseFactor() {
        problem.setEaseFactor(2.5);

        sm2.apply(problem, Rating.EASY);

        assertThat(problem.getEaseFactor()).isEqualTo(2.65, org.assertj.core.data.Offset.offset(1e-9));
    }
}
