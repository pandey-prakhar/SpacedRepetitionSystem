package com.prakhar.revisor.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.prakhar.revisor.enums.DifficultyTag;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "problems")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Problem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false, length = 255)
    private String title;

    @Column(length = 500)
    private String url;

    @Column(length = 100)
    private String pattern;

    @Column(columnDefinition = "TEXT")
    private String notes;

    @Column(name = "solution_code", columnDefinition = "TEXT")
    private String solutionCode;

    @Enumerated(EnumType.STRING)
    @Column(name = "difficulty_tag", length = 10)
    private DifficultyTag difficultyTag;

    @Column(name = "next_review_date", nullable = false)
    private LocalDate nextReviewDate;

    @Column(name = "interval_days", nullable = false)
    private int intervalDays;

    @Column(name = "ease_factor", nullable = false)
    private double easeFactor;

    @Column(nullable = false)
    private int repetitions;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }
}
