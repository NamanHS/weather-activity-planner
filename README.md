# Weather Activity Planner

A GraphQL backend service that recommends and ranks activities for the next seven days based on weather forecasts.

The application retrieves weather forecasts from Open-Meteo, persists them in PostgreSQL, and evaluates configurable business rules to determine activity suitability.

---

# Features

* GraphQL API
* 7-day weather forecast
* PostgreSQL persistence
* Background scheduler for weather refresh
* Configurable refresh interval per city
* Database-driven recommendation rule engine
* Vendor-independent weather conditions
* Global GraphQL error handling
* Unit tested business logic

---

# Supported Activities

* Skiing
* Surfing
* Outdoor Sightseeing
* Indoor Sightseeing

---

# Technology Stack

| Technology | Purpose            |
| ---------- | ------------------ |
| Node.js    | Runtime            |
| NestJS     | Backend Framework  |
| GraphQL    | API                |
| PostgreSQL | Persistent Storage |
| TypeORM    | ORM                |
| Open-Meteo | Weather Provider   |
| Jest       | Unit Testing       |

---

# Project Structure

```text
src
├── clients
│   └── open-meteo
├── common
├── config
├── database
│   └── migrations
├── modules
│   ├── activity
│   ├── city
│   ├── recommendation
│   └── scheduler
```

---

# Prerequisites

* Node.js 22+
* Docker
* Docker Compose
* npm

---

# Installation

Clone the repository.

```bash
git clone <repository-url>

cd weather-activity-planner
```

Install dependencies.

```bash
npm install
```

---

# Configuration

The application loads configuration from YAML files.

```text
application.yaml
application-local.yaml
application-development.yaml
application-test.yaml
application-production.yaml
```

The configuration file is selected using

```text
NODE_ENV
```

For local development the application uses

```text
NODE_ENV=local
```

Database credentials can be modified inside

```text
src/config/application-local.yaml
```

---

# Database

## Start PostgreSQL

```bash
docker compose up -d
```

The PostgreSQL container automatically creates the `weather_activity_planner` database during its first startup.

---

## Create a new migration

Creates an empty migration file.

```bash
npm run migration:create -- src/database/migrations/<MigrationName>
```

Example

```bash
npm run migration:create -- src/database/migrations/CreateCityTable
```

---

## Run migrations

Applies all pending migrations.

```bash
npm run migration:run
```

The project currently contains two migrations.

### InitialSchema

Creates

* Enums
* Tables
* Constraints
* Indexes

### SeedMasterData

Seeds

* Supported Cities
* Activities
* Activity Weather Rules

---

## Revert the last migration

```bash
npm run migration:revert
```

---

## Show migration status

```bash
npm run migration:show
```

---

## Recommended migration workflow

1.

```bash
npm run migration:create -- src/database/migrations/<MigrationName>
```

2.

Implement the migration.

3.

```bash
npm run migration:run
```

4.

If required

```bash
npm run migration:revert
```

---

# Running the Application

Development

```bash
npm run start:watch
```

---

# GraphQL Playground

After starting the application

```
http://localhost:3000/graphql
```

---

# Example Query

```graphql
query {
  activityRecommendations(
    input: {
      cityName: "mumbai"
      countryCode: "IN"
    }
  ) {
    lastRefreshedAt

    dailyRecommendations {
      date

      weather {
        temperatureMin
        temperatureMax
        temperatureMean
        precipitationProbability
        condition
        windSpeed
      }

      activities {
        activityName
        activityDescription
        score
      }
    }
  }
}
```

---

# Running Tests

Execute unit tests.

```bash
npm test
```

Generate coverage.

```bash
npm run test:cov
```

---

# Weather Persistence Strategy

Weather forecasts are **persisted** in PostgreSQL instead of calling the Open-Meteo API for every request.

Each city maintains

* Latest weather forecast
* Last refreshed timestamp
* Last requested timestamp
* Configurable refresh interval

Request flow

1. Client requests recommendations.
2. Persisted weather is checked.
3. If the persisted weather is still valid, recommendations are generated immediately.
4. Otherwise, fresh weather is fetched from Open-Meteo.
5. The persisted weather is updated.
6. Recommendations are generated using the latest persisted data.

A background scheduler periodically refreshes weather for recently requested cities whose persisted forecast has expired.

---

# Rule Engine

Recommendation logic is fully database driven.

Each activity contains multiple weather rules.

Supported comparisons

* Minimum
* Maximum
* Range
* Inclusion

Each rule contributes

* Score
* Penalty

Final recommendation scores are calculated independently for each forecast day.

---

# Design Decisions

Major design decisions are documented separately.

See

```
docs/decisions.md
```

---

# Architecture

Architecture diagrams and design documentation are available in

```
docs/
```

including

* Architecture
* Design Decisions
* Assumptions
* ER Diagram
* Request Flow
* Scheduler Flow

---

# Assumptions

All assumptions made during the implementation are documented in

```
docs/assumptions.md
```

---

# Future Improvements

The following improvements were intentionally left out due to the time constraints.

* Integration tests
* Redis caching layer
* Activity management APIs
* City onboarding APIs
* Authentication & Authorization

---
