package com.prakhar.revisor.repository;

import com.prakhar.revisor.entity.Problem;
import org.springframework.data.jpa.repository.JpaRepository;
import java.time.LocalDate;
import java.util.List;

public interface ProblemRepository extends JpaRepository<Problem, Long> {

    List<Problem> findAllByOrderByCreatedAtDesc();

    List<Problem> findByNextReviewDateLessThanEqualOrderByNextReviewDateAsc(LocalDate date);
}
