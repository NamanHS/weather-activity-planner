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
git clone https://github.com/NamanHS/weather-activity-planner.git

cd weather-activity-planner
```

Install dependencies.

```bash
npm install
```

---

# Quick Start

Run the following commands to start the application locally.

```bash
# Install dependencies
npm install

# Start PostgreSQL
docker compose up -d

# Apply database schema and seed data
npm run migration:run

# Start the application
npm run start:watch
```

Once the application starts, open:

```
http://localhost:8080/graphql
```

Run the example GraphQL query provided below to verify the application is working correctly.

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

The configuration file is selected using:

```text
NODE_ENV
```

For local development:

```text
NODE_ENV=local
```

Database credentials can be modified in:

```text
src/config/application-local.yaml
```

---

# Database Migration guide

## Start PostgreSQL

```bash
docker compose up -d
```

The PostgreSQL container automatically creates the `weather_activity_planner` database during its first startup.

---

## Create a new migration

```bash
npm run migration:create -- src/database/migrations/<MigrationName>
```

Example:

```bash
npm run migration:create -- src/database/migrations/CreateCityTable
```

---

## Run migrations

```bash
npm run migration:run
```

The project currently contains two migrations.

### InitialSchema

Creates:

- Enums
- Tables
- Constraints
- Indexes

### SeedMasterData

Seeds:

- Supported Cities
- Activities
- Activity Weather Rules

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

## Recommended Migration Workflow

1. Create a migration.

```bash
npm run migration:create -- src/database/migrations/<MigrationName>
```

2. Implement the migration.

3. Apply it.

```bash
npm run migration:run
```

4. Revert if required.

```bash
npm run migration:revert
```

---

# Running the Application

```bash
npm run start:watch
```

---

# GraphQL Playground

After starting the application:

```
http://localhost:8080/graphql
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

Run unit tests.

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

Each city maintains:

- Latest weather forecast
- Last refreshed timestamp
- Last requested timestamp
- Configurable refresh interval

Request flow:

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

Supported comparison operators:

- Minimum
- Maximum
- Range
- Inclusion

Each rule contributes:

- Score
- Penalty

Final recommendation scores are calculated independently for each forecast day.

---

# Documentation

Additional design documentation is available under the `docs/` directory.

## Architecture

`docs/architecture.md`

Covers:

- High-level system architecture
- End-to-end request flow
- Weather persistence strategy
- Scheduler workflow
- Open-Meteo client and retry mechanism
- Failure handling
- Scalability considerations

---

## Design Decisions

`docs/decisions.md`

Explains the architectural decisions and trade-offs, including:

- PostgreSQL selection
- JSONB for weather persistence
- Persisting forecasts instead of fetching on every request
- Configurable city refresh intervals
- Refreshing only recently requested cities
- Database-driven recommendation rules
- Generic rule engine
- Vendor-independent weather conditions
- GraphQL error handling
- Testing strategy

---

## Recommendation Engine

`docs/recommendation-engine.md`

Describes how recommendations are generated, including:

- Rule evaluation process
- Supported comparison operators
- Score and penalty calculation
- Activity ranking
- Why penalties were preferred over mandatory rules
- Extensibility of the recommendation engine

---

## Assumptions

`docs/assumptions.md`

Documents all assumptions made while implementing the assignment due to intentionally open-ended requirements.

---

## Entity Relationship Diagram

`docs/erd.md`

Contains the database model and relationships between entities.

---

## AI Usage

`docs/ai-session.md`

Documents how AI was used during development, including design discussions, implementation assistance and decision making.

---

# Future Improvements

The following improvements were intentionally left out due to the time constraints.

- Integration tests
- Alerting and Monitoring
- Redis caching layer
- Activity management APIs
- City onboarding APIs
- Authentication & Authorization