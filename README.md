## Termini

An app for **online booking of time slots** (e.g., football fields) with a **Spring Boot** backend and a **React (Vite)** frontend.

### Features

- **Online bookings**: create/manage appointments and prevent overlaps.
- **Field/service management**: basic data, schedules, availability.
- **Authentication & authorization**: Spring Security + JWT.
- **API documentation**: OpenAPI/Swagger UI (springdoc).
- **Demo seed for development**: options to populate the DB with demo data (see `application.properties`).

### Project structure

- `Termini/` – backend (Spring Boot)
- `Termini/frontend/` – frontend (React + Vite)
- `Termini/docker-compose.yml` – Postgres for local development

### Prerequisites

- **Java 17**
- (Optional) **Docker Desktop** for the database
- **Node.js + npm** (for the frontend)

### Running locally

#### 1) Start the DB (Postgres) with Docker

From the repo root:

```bash
cd Termini
docker compose up -d
```

Postgres will be available on `localhost:5432` with default credentials:
- DB: `termini`
- User: `termini_user`
- Password: `termini_pass`

#### 2) Start the backend (Spring Boot)

From `Termini/`:

```bash
./mvnw spring-boot:run
```

On Windows you can use:

```bash
./mvnw.cmd spring-boot:run
```

The backend usually runs at `http://localhost:8080`.

#### 3) Start the frontend (React)

In another terminal:

```bash
cd Termini/frontend
npm install
npm run dev
```

The frontend runs at `http://localhost:5173`.

### API documentation

Once the backend is running:
- Swagger UI: `http://localhost:8080/swagger-ui/index.html`

### Important configuration

Main configuration lives in `Termini/src/main/resources/application.properties`.

- **Environment overrides**: you can override settings via env vars (useful for production/deployments).
  - `TERMINI_DB_URL`, `TERMINI_DB_USERNAME`, `TERMINI_DB_PASSWORD`
  - `TERMINI_JWT_SECRET` (must be at least 32 characters)

