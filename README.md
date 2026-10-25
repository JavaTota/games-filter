# GameFilter — React + FastAPI + Supabase

GameFilter is a full-stack game discovery and community-review application. The repository is intentionally split into a React frontend and Python backend so the security boundary, business logic, and data model are visible to a reviewer.

## Architecture

```
Browser
  │
  ├── React + TypeScript + Chakra UI       frontend/
  │       ├── Discover / filters
  │       ├── game details
  │       ├── comparison
  │       ├── personal library
  │       ├── profile + avatar
  │       └── GameMeter reviews
  │
  ├── Supabase Auth
  │       └── browser receives user JWT
  │
  └── FastAPI                              backend/
          ├── verifies Supabase JWT
          ├── RAWG proxy + cache
          ├── review API
          ├── library API
          ├── profile/avatar API
          └── forwards JWT to Supabase
                    │
                    ├── Postgres + RLS
                    └── Storage avatars
```

The backend intentionally forwards the signed-in user's JWT to Supabase instead of using an elevated database key. RLS therefore remains the final authorization boundary.

## Database tables

`supabase/schema.sql` creates the complete database layer:

| Table                  | Purpose                   | Important constraint            |
| ---------------------- | ------------------------- | ------------------------------- |
| `profiles`             | Public name, avatar, bio  | One row per Supabase Auth user  |
| `library_entries`      | Favorites/backlog/status  | Unique `(user_id, game_id)`     |
| `reviews`              | GameMeter written reviews | **Unique `(user_id, game_id)`** |
| `review_helpful_votes` | Helpful votes on reviews  | Unique `(review_id, user_id)`   |

Two read models are also created:

- `review_feed` joins each review to its current profile name/avatar and helpful count.
- `game_review_stats` calculates GameMeter score, recommendation percentage, and review count.

### One review per user

The UI does not merely hide the review form. PostgreSQL enforces:

```sql
unique (user_id, game_id)
```

FastAPI writes reviews with an upsert on that same key. A second submission therefore edits the user's existing review; it cannot create a duplicate even if someone bypasses React.

## Profile pictures

Every account gets a `profiles` row automatically after Supabase Auth signup. Profile pictures are stored in the public `avatars` bucket under:

```text
<user-id>/avatar
```

Storage RLS allows a user to upload, replace, or delete only objects inside their own UID folder. FastAPI additionally validates image type and enforces a 2 MB maximum.

## Repository layout

```text
.github/
  workflows/
    ci-cd.yml

frontend/
  public/
  src/
    assets/
    components/
    context/
    hooks/
    lib/
    pages/
    services/
    types/
    utils/
  tests/
  package.json
  vite.config.ts
  Dockerfile

backend/
  app/
  tests/
  pyproject.toml
  Dockerfile

docker-compose.yml
Makefile
README.md
DEPLOYMENT.md
```

All React/Vite code, configuration, tests, and public assets live under `frontend/`. The repository root only contains project-level orchestration and documentation.

## Backend API

```text
GET    /api/health
GET    /api/rawg

GET    /api/profile
PATCH  /api/profile
POST   /api/profile/avatar
DELETE /api/profile/avatar

GET    /api/library
GET    /api/library/{game_id}
PUT    /api/library/{game_id}
DELETE /api/library/{game_id}

GET    /api/games/{game_id}/reviews
PUT    /api/games/{game_id}/review
DELETE /api/games/{game_id}/review
PUT    /api/reviews/{review_id}/helpful
DELETE /api/reviews/{review_id}/helpful
```

FastAPI also exposes interactive API documentation at `/docs`.

## Supabase setup

1. Create a Supabase project.
2. Enable Email authentication.
3. Run `supabase/schema.sql` in **SQL Editor**.
4. Copy the project URL and **publishable key**.

If the older GameFilter prototype schema was already installed, run `supabase/migrate_from_prototype.sql` first and then run `supabase/schema.sql`. The migration preserves existing reviews and library rows while moving public reviewer identity into `profiles`.

The schema creates RLS policies for every table and for the avatar Storage bucket.

## Local development with Docker

Copy the examples:

```bash
cp frontend/.env.example frontend/.env
cp backend/.env.example backend/.env
```

Fill in:

```text
VITE_SUPABASE_URL
VITE_SUPABASE_PUBLISHABLE_KEY
SUPABASE_URL
SUPABASE_PUBLISHABLE_KEY
RAWG_API_KEY
```

Then run the entire application:

```bash
docker compose --env-file frontend/.env up --build
```

Open:

```text
Frontend: http://localhost:8080
FastAPI:  http://localhost:8000/docs
```

Nginx proxies `/api` to the Python container, so the browser still sees one application origin.

### Run services separately

Backend:

```bash
cd backend
python -m venv .venv
source .venv/bin/activate      # Windows: .venv\Scripts\activate
pip install -r requirements-dev.txt
uvicorn app.main:app --reload
```

Frontend:

```bash
cd frontend
npm ci
npm run dev
```

Vite proxies `/api` to `localhost:8000` during local development.

## CI/CD through GitHub Actions

Every pull request and push runs:

```text
Frontend: npm ci → tests → ESLint → TypeScript/Vite build
Backend:  pip install → Ruff → pytest
                      ↓
              build both Docker images
```

A push to `main` then deploys two Vercel projects:

1. `backend/` as a FastAPI container using `Dockerfile.vercel`.
2. `frontend/` as the Vite application, built with the deployed backend URL.
3. Smoke tests verify the frontend and `/api/health`.

Required GitHub Actions secrets:

```text
VERCEL_TOKEN
VERCEL_ORG_ID
VERCEL_BACKEND_PROJECT_ID
VERCEL_FRONTEND_PROJECT_ID
VITE_SUPABASE_URL
VITE_SUPABASE_PUBLISHABLE_KEY
```

The backend Vercel project itself must contain:

```text
RAWG_API_KEY
SUPABASE_URL
SUPABASE_PUBLISHABLE_KEY
CORS_ORIGINS
```

The frontend and backend use separate Vercel project IDs because they are separate deployable services.

## Security decisions

- RAWG API key exists only in Python.
- React never sends `user_id` for reviews/library writes.
- FastAPI obtains user identity from a verified Supabase JWT.
- Supabase RLS still authorizes every user-owned row.
- A database unique constraint guarantees one review per user/game.
- Helpful votes are also unique per user/review.
- Avatar writes are restricted to the user's own Storage folder.
- The backend uses the publishable key + user JWT rather than an RLS-bypassing secret key for normal user operations.

## Portfolio talking points

This version demonstrates a genuine full-stack boundary rather than a frontend calling third-party APIs directly: React state and UX, Python APIs, authentication, relational modeling, constraints, RLS, object storage, Docker, tests, linting, and automated deployment all work as separate layers.
