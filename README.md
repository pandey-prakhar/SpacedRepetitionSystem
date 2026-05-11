# Revisor — Spaced Repetition for Coding Problems

A plain, no-fuss web app for revisiting coding problems (LeetCode-style) on a spaced-repetition schedule using the SM-2 algorithm.

Most "review" tools for coding problems are either overkill (full LMS systems), abandoned, or buried inside paid platforms. Revisor is small, local, fast, and built to actually be used every day — open it, see what's due, attempt the problem, peek at your notes/solution only if you got stuck, and rate yourself.

Also a hands-on learning project for Spring Boot, JPA/Hibernate, REST API design, and modern React.

## Screenshots

> _(coming soon — placeholder)_

<!-- Drop screenshots into a `docs/screenshots/` folder and reference them here, e.g.:
![Today tab](docs/screenshots/today.png)
![Add problem](docs/screenshots/add.png)
-->


## Stack

| Layer | Tech |
|---|---|
| Backend | Spring Boot 3.5, Java 21, Maven |
| Persistence | JPA / Hibernate, H2 (file-based for dev, in-memory for tests) |
| Frontend | Vite, React 19, Tailwind CSS 3 |

## Features

- **Add** coding problems with title, URL, difficulty, pattern, a short description, a sample test case, plus deeper notes and full solution code.
- **Today's reviews** — problems whose next-review date is today or earlier. Description and sample test case are shown up front so you can attempt the problem without leaving the app.
- **Hide-then-reveal** notes and solution on the Today tab — the SRS pattern: try first, peek only if needed.
- **Rate** each review (Again / Hard / Good / Easy); SM-2 schedules the next review automatically without resetting your work.
- **All Problems** view with expandable rows: collapsed for fast scanning, click to unfold the full description / test case / notes / solution for free-form revision any time.
- **Inline edit** on any problem (title, URL, pattern, difficulty, description, test case, notes, solution code). SM-2 schedule is preserved across edits.
- **Delete** problems with a confirmation prompt.
- **Persistent storage** — dev data lives in a local H2 file and survives restarts.

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
            ├── TodayTab.jsx          Due problems + review buttons + reveal
            ├── AllTab.jsx            All problems + expandable details + inline edit + delete
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
- H2 console: http://localhost:8080/h2-console — JDBC URL `jdbc:h2:file:./data/revisordb`, user `sa`, no password.
- Data file: `data/revisordb.mv.db` is created (relative to the working directory you launched the app from) and persists across restarts. Gitignored.

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
Covers `Sm2Service` (algorithm) and `ProblemController` (full Spring context + H2 integration). Tests use a separate in-memory H2 (`src/test/resources/application.properties`) so they never touch the dev data file.

## Configuration

Dev profile in `application.properties`:
```properties
spring.datasource.url=jdbc:h2:file:./data/revisordb;AUTO_SERVER=TRUE
spring.h2.console.enabled=true
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true
```
- `file:./data/revisordb` — data persists in a local file across restarts.
- `AUTO_SERVER=TRUE` — lets the H2 web console attach to the same file the app is using.
- `ddl-auto=update` — Hibernate keeps the schema across restarts and adds new columns when entities change. For renames / destructive migrations, Flyway is on the roadmap.

Test profile (`src/test/resources/application.properties`) overrides this to use an in-memory H2 with `create-drop`, so the test suite is fast and isolated.

## Roadmap

- [ ] GitHub OAuth login (schema is already multi-user; `default@revisor.dev` is just a seeded placeholder)
- [ ] Flyway migrations to replace Hibernate `update`
- [ ] `ProblemResponse` DTO instead of returning entities directly
- [ ] Search / filter on All Problems
- [ ] Keyboard shortcuts for review (1/2/3/4 → Again/Hard/Good/Easy)
- [ ] Persistent DB (Postgres) and deployment

## Status

Backend MVP and frontend MVP complete and usable end-to-end on `localhost`. No auth yet — single seeded user. Currently in a "use it for a few days and see what hurts" phase before adding more features.
