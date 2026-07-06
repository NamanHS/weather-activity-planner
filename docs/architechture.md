# Architecture

## Overview

The Weather Activity Planner consists of five primary components:

- **GraphQL API** — exposes activity recommendations.
- **Recommendation Service** — orchestrates recommendation generation.
- **City Service** — manages persisted weather forecasts and refresh logic.
- **Scheduler** — proactively refreshes weather for active cities.
- **PostgreSQL** — persists cities and its weather forecast, activities and recommendation rules.

Instead of calling the Open-Meteo API for every request, weather forecasts are persisted in PostgreSQL and refreshed only when necessary.

---

# Request Flow

1. A client sends a GraphQL request for activity recommendations.
2. The Recommendation Service requests weather from the City Service.
3. The City Service loads the requested city from PostgreSQL.
4. The city's `lastRequestedAt` timestamp is updated.
5. The service determines whether the persisted forecast has expired using:

```text
lastRefreshedAt + refreshIntervalMinutes <= Now
```

- If the forecast has expired, the latest weather is fetched from Open-Meteo and persisted.
- Otherwise, the persisted forecast is reused.

6. Activities and their weather rules are loaded from PostgreSQL.
7. The Recommendation Rule Engine evaluates every activity against each day's weather.
8. Activities are ranked by score in descending order.
9. The GraphQL response is returned to the client.

---

# Scheduler

The scheduler executes every **30 minutes**.

Rather than refreshing every configured city, it refreshes only cities that satisfy both conditions:

- The city was requested recently (`lastRequestedAt` falls within the configured active window).
- The persisted weather has expired based on the city's configured `refreshIntervalMinutes`.

The active city window is configurable through:

```yaml
scheduler:
  cityWeatherRefresh:
    activeCityWindowDays
```

The SQL query itself returns only eligible cities.

Once the eligible cities are fetched, the scheduler:

- splits them into configurable batches
- refreshes each batch concurrently using `Promise.all`
- persists the refreshed weather
- continues processing even if individual batch refresh fail

Batch size is configurable through:

```yaml
scheduler:
  cityWeatherRefresh:
    batchSize
```

This design prevents unnecessary third-party API calls while keeping frequently requested cities up to date.

---

# Weather Persistence

Each city stores:

- `weatherData`
- `lastRequestedAt`
- `lastRefreshedAt`
- `refreshIntervalMinutes`

The application behaves similarly to a lazy-refresh cache, with one important difference:

Weather is **persisted in PostgreSQL** instead of being stored in memory.

This provides several advantages:

- survives application restarts
- shared across multiple application instances
- avoids unnecessary external API calls
- reduces request latency

---

# Open-Meteo Client

Communication with Open-Meteo is encapsulated within a dedicated client.

The following values are configurable through application configuration:

- `forecastDays`
- `timeoutMs`
- `retryCount`
- `retryDelayMs`

If a request fails due to a transient network or provider issue, the client automatically retries the request using the configured retry policy before propagating the failure.

This improves resilience while allowing retry behaviour to be tuned without changing application code.

---

# Failure Handling

Failures are isolated wherever possible.

### Scheduler

- A failure while refreshing one batch of city does not stop the scheduler.
- The failure is logged.
- Remaining batches continue processing.

### Recommendation Requests

Recommendation generation primarily relies on persisted weather.

Only when the persisted weather has expired does the application attempt to fetch fresh weather from Open-Meteo.

If Open-Meteo cannot be reached after all configured retry attempts, the request fails with a consistent GraphQL error response.

---

# Scalability

The current design scales well because it:

- persists weather instead of fetching it on every request
- refreshes only recently requested cities
- allows each city to define its own refresh interval
- processes scheduler refreshes in configurable concurrent batches
- keeps recommendation rules data-driven instead of hardcoded
- isolates third-party API failures from the rest of the application

---

## Operational Monitoring

To improve production reliability, the scheduler should be monitored through application metrics and alerting.

Recommended alerts include:

- Scheduler job fails continuously for a configurable number of executions within a configurable time window.
- Consecutive Open-Meteo API failures exceed a configured threshold.
- Number of eligible cities awaiting refresh grows unexpectedly.

These alerts enable operators to detect issues such as scheduler failures, third-party API outages, or persistent refresh backlogs before they impact users.

**Note:** Alerting and monitoring infrastructure (CloudWatch, Newrelic, etc) was not implemented as part of this assignment due to time constraints but would be recommended for a production deployment.
