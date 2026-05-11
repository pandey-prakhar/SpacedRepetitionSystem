# Revisor — Spaced Repetition System for Coding Problems

A web app for revisiting coding problems (LeetCode-style) on a spaced-repetition schedule using the SM-2 algorithm. Built as a hands-on project to deeply explore Spring Boot, JPA/Hibernate, REST API design, and modern React.

## Stack

| Layer | Tech |
|---|---|
| Backend | Spring Boot 3.5, Java 21, Maven |
| Persistence | JPA / Hibernate, H2 (in-memory, dev) |
| Frontend | Vite, React 19, Tailwind CSS 3 |

## Features

- Add coding problems with title, URL, difficulty, pattern, notes, and solution code.
- See **Today's reviews** — problems whose next-review date is today or earlier.
- Rate each review (**Again / Hard / Good / Easy**); SM-2 schedules the next review.
- Browse all problems with their current SM-2 state (interval, ease factor, repetitions).
- Delete problems.

## Architecture

```
SpacedRepetitionSystem/
├── backend/revisor/                  Spring Boot API
│   └── src/main/java/com/prakhar/revisor/
│       ├── config/DataSeeder.java    Seeds the default user on startup
│       ├── entity/                   JPA entities: User, Problem
│       ├── enums/                    DifficultyTag, Rating
│       ├── repository/               Spring Data JPA repos
│       ├── dto/                      Request DTOs (Java records)
│       ├── service/                  Sm2Service, ProblemService
│       ├── controller/               ProblemController (REST)
│       └── exception/                GlobalExceptionHandler + custom exceptions
└── frontend/revisor-frontend/        Vite + React UI
    └── src/
        ├── api.js                    Centralised fetch wrappers
        ├── App.jsx                   Tab shell
        └── components/
            ├── TodayTab.jsx          Due problems + review buttons
            ├── AllTab.jsx            All problems + delete
            └── AddTab.jsx            Create form
```

### Key backend decisions
- **Multi-user schema from day 1** — `Problem.user_id` FK exists now; auth is deferred. A seeded `default@revisor.dev` user owns everything in the MVP.
- **Constructor injection** via Lombok `@RequiredArgsConstructor` (no field `@Autowired`).
- **`@Transactional` on service methods**, `readOnly=true` on reads.
- **DTOs as Java records** for request bodies — entities are never directly deserialised from JSON.
- **`FetchType.LAZY` everywhere**, `@JsonIgnore` on `Problem.user` to prevent serialisation issues.
- **Centralised error handling** via `@RestControllerAdvice`.

### SM-2 algorithm (`Sm2Service`)
```
AGAIN: ef = max(1.3, ef - 0.20), interval = 1,                       reps = 0,  next = today + 1
HARD:  ef = max(1.3, ef - 0.15), interval = max(1, round(i * 1.2)),  reps++,    next = today + interval
GOOD:  reps == 0 → 1d, reps == 1 → 3d, else round(i * ef),           reps++,    next = today + interval
EASY:  interval = round(i * ef * 1.3), ef += 0.15,                   reps++,    next = today + interval
```

## REST API

All routes are under `/api`. CORS allows `http://localhost:5173`.

| Method | Path | Description |
|---|---|---|
| `POST` | `/problems` | Create a problem (next review = today) |
| `GET` | `/problems` | List all (newest first) |
| `GET` | `/problems/due` | Problems where `nextReviewDate <= today` |
| `GET` | `/problems/{id}` | Get one |
| `PUT` | `/problems/{id}` | Partial update (null fields = unchanged) |
| `POST` | `/problems/{id}/review` | Apply SM-2; body `{"rating":"GOOD"}` |
| `DELETE` | `/problems/{id}` | Delete |

## Running locally

### Prerequisites
- JDK 21
- Node.js 20+
- Maven wrapper is included; no global Maven needed.

### Backend
```bash
cd backend/revisor
./mvnw spring-boot:run
```
- API: http://localhost:8080
- H2 console: http://localhost:8080/h2-console — JDBC URL `jdbc:h2:mem:revisordb`, user `sa`, no password.

### Frontend
```bash
cd frontend/revisor-frontend
npm install
npm run dev
```
Open http://localhost:5173.

### Quick smoke test (curl)
```bash
# create
curl -X POST http://localhost:8080/api/problems \
  -H "Content-Type: application/json" \
  -d '{"title":"Two Sum","difficultyTag":"EASY"}'

# review
curl -X POST http://localhost:8080/api/problems/1/review \
  -H "Content-Type: application/json" \
  -d '{"rating":"GOOD"}'

# list due
curl http://localhost:8080/api/problems/due
```

## Tests

```bash
cd backend/revisor
./mvnw test
```
Covers `Sm2Service` (algorithm) and `ProblemController` (full Spring context + H2 integration).

## Configuration

Dev profile in `application.properties`:
```properties
spring.datasource.url=jdbc:h2:mem:revisordb;DB_CLOSE_DELAY=-1;DB_CLOSE_ON_EXIT=FALSE
spring.h2.console.enabled=true
spring.jpa.hibernate.ddl-auto=create-drop
spring.jpa.show-sql=true
```
Schema is dropped and recreated on each restart in dev. Production would replace `create-drop` with Flyway-managed migrations.

## Roadmap

- [ ] Spring Security + JWT authentication (schema is already multi-user)
- [ ] Flyway migrations to replace `create-drop`
- [ ] `ProblemResponse` DTO instead of returning entities directly
- [ ] Edit-problem UI
- [ ] Tags / patterns view, search and filtering
- [ ] Persistent DB (Postgres) and deployment
