package com.prakhar.revisor.dto;

import com.prakhar.revisor.enums.DifficultyTag;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CreateProblemRequest(

        @NotBlank(message = "Title must not be blank")
        @Size(max = 255, message = "Title must not exceed 255 characters")
        String title,

        @Size(max = 500, message = "URL must not exceed 500 characters")
        String url,

        @Size(max = 100, message = "Pattern must not exceed 100 characters")
        String pattern,

        String description,
        String sampleTestCase,
        String notes,
        String solutionCode,
        DifficultyTag difficultyTag
) {}
