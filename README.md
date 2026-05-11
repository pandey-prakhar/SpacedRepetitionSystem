# Revisor — Spaced Repetition for DSA Problems

A plain, no-fuss web app for revisiting coding problems (LeetCode-style) on a spaced-repetition schedule using the SM-2 algorithm.

## Why I built this

I'm a developer, and like most devs prepping for interviews I keep coming back to DSA problems — on LeetCode, Codeforces, NeetCode, wherever. The pattern is always the same: solve a problem, feel clever, forget it three weeks later, re-solve it from scratch when a variant shows up. Keeping DSA fresh is a slow, ongoing thing — at this stage of my career it's something I need to *keep an eye on*, not cram once.

There are plenty of good general-purpose spaced repetition tools out there — Anki, RemNote, full study apps. They work, and they're built for everything: medical school flashcards, language vocab, history trivia. Bending them around "I want to revisit Two Sum in 5 days, with my notes and my solution code right there" felt like fighting the tool. None of them speak the language of coding problems out of the box.

Revisor is the focused thing I wanted: small, fast, opinionated about DSA specifically. Add a problem with its description, a sample test case, your notes, your solution. When it's due, attempt it again, reveal your notes only if you got stuck, rate yourself honestly. SM-2 picks when to show it next. That's the whole app — no decks, no folders, no LMS, no AI tutor.

If you've ever solved Two Sum, felt great, and bombed Three Sum a month later, this is for you.

## Stack and project type

Hands-on learning project for Spring Boot, JPA/Hibernate, REST API design, and modern React — alongside being a tool I actually intend to use.

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

Toward a public deploy:
- [ ] Auth (GitHub + Google OAuth — covers devs and non-devs without storing passwords)
- [ ] Postgres + Flyway migrations to replace local H2
- [ ] Per-user limits: 500 problems/user, sensible length caps on text fields
- [ ] Rate limiting on `/api/**`
- [ ] Production CORS and HTTPS
- [ ] Deploy backend (Render) + frontend (Vercel) + custom domain

Quality-of-life:
- [ ] Search / filter on All Problems
- [ ] Keyboard shortcuts for review (1/2/3/4 → Again/Hard/Good/Easy)
- [ ] `ProblemResponse` DTO instead of returning entities directly
- [ ] Seed content (e.g., NeetCode 150) so new users have something to review on day 1

## Status

Backend and frontend MVP complete and usable end-to-end on `localhost`. CRUD + SM-2 review flow working, with persistent local H2 storage, expandable browsing of the full problem set, and inline edit. No auth yet — single seeded user. Currently in a "use it for a few days and see what hurts" phase before layering on OAuth, Postgres, and a public deploy.
