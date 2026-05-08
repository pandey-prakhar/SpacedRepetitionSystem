package com.prakhar.revisor.controller;

import com.prakhar.revisor.dto.CreateProblemRequest;
import com.prakhar.revisor.dto.ReviewRequest;
import com.prakhar.revisor.dto.UpdateProblemRequest;
import com.prakhar.revisor.entity.Problem;
import com.prakhar.revisor.service.ProblemService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/problems")
@CrossOrigin(origins = "http://localhost:5173")
@RequiredArgsConstructor
public class ProblemController {

    private final ProblemService problemService;

    @PostMapping
    public ResponseEntity<Problem> createProblem(@Valid @RequestBody CreateProblemRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(problemService.createProblem(request));
    }

    @GetMapping
    public ResponseEntity<List<Problem>> getAllProblems() {
        return ResponseEntity.ok(problemService.getAllProblems());
    }

    @GetMapping("/due")
    public ResponseEntity<List<Problem>> getDueProblems() {
        return ResponseEntity.ok(problemService.getDueProblems());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Problem> getProblemById(@PathVariable Long id) {
        return ResponseEntity.ok(problemService.getProblemById(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Problem> updateProblem(
            @PathVariable Long id,
            @Valid @RequestBody UpdateProblemRequest request) {
        return ResponseEntity.ok(problemService.updateProblem(id, request));
    }

    @PostMapping("/{id}/review")
    public ResponseEntity<Problem> reviewProblem(
            @PathVariable Long id,
            @Valid @RequestBody ReviewRequest request) {
        return ResponseEntity.ok(problemService.reviewProblem(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteProblem(@PathVariable Long id) {
        problemService.deleteProblem(id);
        return ResponseEntity.noContent().build();
    }
}
