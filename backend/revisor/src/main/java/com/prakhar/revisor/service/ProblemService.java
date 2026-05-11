package com.prakhar.revisor.service;

import com.prakhar.revisor.config.DataSeeder;
import com.prakhar.revisor.dto.CreateProblemRequest;
import com.prakhar.revisor.dto.ReviewRequest;
import com.prakhar.revisor.dto.UpdateProblemRequest;
import com.prakhar.revisor.entity.Problem;
import com.prakhar.revisor.entity.User;
import com.prakhar.revisor.exception.ProblemNotFoundException;
import com.prakhar.revisor.repository.ProblemRepository;
import com.prakhar.revisor.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ProblemService {

    private static final double INITIAL_EASE_FACTOR = 2.5;

    private final ProblemRepository problemRepository;
    private final UserRepository userRepository;
    private final Sm2Service sm2Service;

    private User getDefaultUser() {
        return userRepository.findByEmail(DataSeeder.DEFAULT_USER_EMAIL)
                .orElseThrow(() -> new IllegalStateException(
                        "Default user not found. DataSeeder may have failed."));
    }

    @Transactional
    public Problem createProblem(CreateProblemRequest request) {
        Problem problem = Problem.builder()
                .user(getDefaultUser())
                .title(request.title())
                .url(request.url())
                .pattern(request.pattern())
                .description(request.description())
                .sampleTestCase(request.sampleTestCase())
                .notes(request.notes())
                .solutionCode(request.solutionCode())
                .difficultyTag(request.difficultyTag())
                .nextReviewDate(LocalDate.now())
                .intervalDays(1)
                .easeFactor(INITIAL_EASE_FACTOR)
                .repetitions(0)
                .build();
        return problemRepository.save(problem);
    }

    @Transactional(readOnly = true)
    public List<Problem> getAllProblems() {
        return problemRepository.findAllByOrderByCreatedAtDesc();
    }

    @Transactional(readOnly = true)
    public List<Problem> getDueProblems() {
        return problemRepository.findByNextReviewDateLessThanEqualOrderByNextReviewDateAsc(LocalDate.now());
    }

    @Transactional(readOnly = true)
    public Problem getProblemById(Long id) {
        return problemRepository.findById(id)
                .orElseThrow(() -> new ProblemNotFoundException(id));
    }

    @Transactional
    public Problem updateProblem(Long id, UpdateProblemRequest request) {
        Problem problem = getProblemById(id);
        if (request.title() != null)        problem.setTitle(request.title());
        if (request.url() != null)          problem.setUrl(request.url());
        if (request.pattern() != null)        problem.setPattern(request.pattern());
        if (request.description() != null)    problem.setDescription(request.description());
        if (request.sampleTestCase() != null) problem.setSampleTestCase(request.sampleTestCase());
        if (request.notes() != null)          problem.setNotes(request.notes());
        if (request.solutionCode() != null)   problem.setSolutionCode(request.solutionCode());
        if (request.difficultyTag() != null) problem.setDifficultyTag(request.difficultyTag());
        return problemRepository.save(problem);
    }

    @Transactional
    public Problem reviewProblem(Long id, ReviewRequest request) {
        Problem problem = getProblemById(id);
        sm2Service.apply(problem, request.rating());
        return problemRepository.save(problem);
    }

    @Transactional
    public void deleteProblem(Long id) {
        Problem problem = getProblemById(id);
        problemRepository.delete(problem);
    }
}
