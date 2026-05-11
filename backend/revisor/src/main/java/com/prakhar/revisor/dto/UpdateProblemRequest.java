package com.prakhar.revisor.dto;

import com.prakhar.revisor.enums.DifficultyTag;
import jakarta.validation.constraints.Size;

public record UpdateProblemRequest(

        @Size(max = 255)
        String title,

        @Size(max = 500)
        String url,

        @Size(max = 100)
        String pattern,

        String description,
        String sampleTestCase,
        String notes,
        String solutionCode,
        DifficultyTag difficultyTag
) {}
