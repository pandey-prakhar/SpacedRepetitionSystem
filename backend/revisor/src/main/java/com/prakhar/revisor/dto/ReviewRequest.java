package com.prakhar.revisor.dto;

import com.prakhar.revisor.enums.Rating;
import jakarta.validation.constraints.NotNull;

public record ReviewRequest(

        @NotNull(message = "Rating must not be null")
        Rating rating
) {}
