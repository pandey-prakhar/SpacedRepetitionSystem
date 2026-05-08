package com.prakhar.revisor.controller;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.prakhar.revisor.config.DataSeeder;
import com.prakhar.revisor.entity.Problem;
import com.prakhar.revisor.enums.DifficultyTag;
import com.prakhar.revisor.repository.ProblemRepository;
import com.prakhar.revisor.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDate;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class ProblemControllerIntegrationTest {

    @Autowired private MockMvc mockMvc;
    @Autowired private ObjectMapper objectMapper;
    @Autowired private ProblemRepository problemRepository;
    @Autowired private UserRepository userRepository;

    @BeforeEach
    void seedDefaultUserIfMissing() {
        // Belt-and-suspenders: with @Transactional rollback the seeded row may be invisible.
        if (userRepository.findByEmail(DataSeeder.DEFAULT_USER_EMAIL).isEmpty()) {
            userRepository.save(com.prakhar.revisor.entity.User.builder()
                    .email(DataSeeder.DEFAULT_USER_EMAIL)
                    .username("default")
                    .build());
        }
    }

    // ---------- POST /problems ----------

    @Test
    @DisplayName("POST /problems with valid body returns 201 and persists")
    void create_valid() throws Exception {
        String body = """
                { "title": "Two Sum", "url": "https://leetcode.com/problems/two-sum",
                  "pattern": "Hash Map", "difficultyTag": "EASY" }
                """;

        mockMvc.perform(post("/api/problems")
                        .contentType(MediaType.APPLICATION_JSON).content(body))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").exists())
                .andExpect(jsonPath("$.title").value("Two Sum"))
                .andExpect(jsonPath("$.intervalDays").value(1))
                .andExpect(jsonPath("$.repetitions").value(0))
                .andExpect(jsonPath("$.easeFactor").value(2.5))
                .andExpect(jsonPath("$.nextReviewDate").value(LocalDate.now().toString()));
    }

    @Test
    @DisplayName("POST /problems with missing title returns 400 with field error")
    void create_missingTitle_returns400() throws Exception {
        mockMvc.perform(post("/api/problems")
                        .contentType(MediaType.APPLICATION_JSON).content("{}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.errors.title").exists());
    }

    @Test
    @DisplayName("POST /problems with malformed JSON returns 400")
    void create_malformedJson_returns400() throws Exception {
        mockMvc.perform(post("/api/problems")
                        .contentType(MediaType.APPLICATION_JSON).content("{ not json"))
                .andExpect(status().isBadRequest());
    }

    // ---------- GET /problems ----------

    @Test
    @DisplayName("GET /problems returns problems newest first")
    void getAll_orderedNewestFirst() throws Exception {
        Long firstId = createProblem("Problem A");
        Thread.sleep(10); // ensure timestamp ordering
        Long secondId = createProblem("Problem B");

        mockMvc.perform(get("/api/problems"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(secondId))
                .andExpect(jsonPath("$[1].id").value(firstId));
    }

    // ---------- GET /problems/due ----------

    @Test
    @DisplayName("GET /problems/due includes problems due today")
    void getDue_includesToday() throws Exception {
        Long id = createProblem("Due Today");

        mockMvc.perform(get("/api/problems/due"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[?(@.id == " + id + ")]").exists());
    }

    @Test
    @DisplayName("GET /problems/due excludes future-scheduled problems")
    void getDue_excludesFuture() throws Exception {
        Long id = createProblem("Future");
        Problem p = problemRepository.findById(id).orElseThrow();
        p.setNextReviewDate(LocalDate.now().plusDays(7));
        problemRepository.save(p);

        mockMvc.perform(get("/api/problems/due"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[?(@.id == " + id + ")]").doesNotExist());
    }

    // ---------- GET /problems/{id} ----------

    @Test
    @DisplayName("GET /problems/{id} for existing problem returns 200")
    void getOne_exists() throws Exception {
        Long id = createProblem("Existing");

        mockMvc.perform(get("/api/problems/" + id))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(id));
    }

    @Test
    @DisplayName("GET /problems/{id} for missing id returns 404 JSON")
    void getOne_notFound() throws Exception {
        mockMvc.perform(get("/api/problems/999999"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.status").value(404))
                .andExpect(jsonPath("$.message").value(org.hamcrest.Matchers.containsString("999999")));
    }

    // ---------- PUT /problems/{id} ----------

    @Test
    @DisplayName("PUT /problems/{id} performs partial update — null fields unchanged")
    void update_partial() throws Exception {
        Long id = createProblem("Original Title");

        String body = """
                { "pattern": "Updated Pattern" }
                """;

        mockMvc.perform(put("/api/problems/" + id)
                        .contentType(MediaType.APPLICATION_JSON).content(body))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.title").value("Original Title"))
                .andExpect(jsonPath("$.pattern").value("Updated Pattern"));
    }

    // ---------- POST /problems/{id}/review ----------

    @Test
    @DisplayName("POST /problems/{id}/review with GOOD advances schedule by 1 day on first review")
    void review_goodFirstRep() throws Exception {
        Long id = createProblem("To Review");

        mockMvc.perform(post("/api/problems/" + id + "/review")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"rating\":\"GOOD\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.repetitions").value(1))
                .andExpect(jsonPath("$.intervalDays").value(1))
                .andExpect(jsonPath("$.nextReviewDate").value(LocalDate.now().plusDays(1).toString()));
    }

    @Test
    @DisplayName("POST /problems/{id}/review with invalid rating returns 400")
    void review_invalidRating_returns400() throws Exception {
        Long id = createProblem("Invalid Rating Test");

        mockMvc.perform(post("/api/problems/" + id + "/review")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"rating\":\"NOT_A_RATING\"}"))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("POST /problems/{id}/review on missing id returns 404")
    void review_notFound() throws Exception {
        mockMvc.perform(post("/api/problems/999999/review")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"rating\":\"GOOD\"}"))
                .andExpect(status().isNotFound());
    }

    // ---------- DELETE /problems/{id} ----------

    @Test
    @DisplayName("DELETE /problems/{id} returns 204 and removes the problem")
    void delete_success() throws Exception {
        Long id = createProblem("To Delete");

        mockMvc.perform(delete("/api/problems/" + id))
                .andExpect(status().isNoContent());

        assertThat(problemRepository.findById(id)).isEmpty();
    }

    @Test
    @DisplayName("DELETE /problems/{id} on missing id returns 404")
    void delete_notFound() throws Exception {
        mockMvc.perform(delete("/api/problems/999999"))
                .andExpect(status().isNotFound());
    }

    // ---------- helpers ----------

    private Long createProblem(String title) throws Exception {
        String body = String.format("""
                { "title": "%s", "difficultyTag": "MEDIUM" }
                """, title);

        MvcResult result = mockMvc.perform(post("/api/problems")
                        .contentType(MediaType.APPLICATION_JSON).content(body))
                .andExpect(status().isCreated())
                .andReturn();

        JsonNode node = objectMapper.readTree(result.getResponse().getContentAsString());
        return node.get("id").asLong();
    }
}
