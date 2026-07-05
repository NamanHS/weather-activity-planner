# Design Decisions

This document explains the key architectural and implementation decisions made while building the Weather Activity Planner.

The assignment intentionally left several implementation details open-ended. The following sections describe the reasoning behind the choices made, together with the trade-offs considered.

---

# 1. PostgreSQL as the Primary Data Store

## Decision

PostgreSQL was selected as the primary datastore instead of an in-memory cache or NoSQL database.

## Reasoning

The application needs to persist weather forecasts rather than retrieve them from the Open-Meteo API on every request.

Using PostgreSQL provides:

- Durable persistence
- ACID guarantees
- Simple operational model
- Excellent support for structured relational data
- Native JSON support (JSONB)

The amount of weather data stored per city is relatively small, making PostgreSQL an excellent fit.

## Alternatives Considered

### Redis

Redis would behave as a cache rather than the application's source of truth.

Additional persistence would still be required.

### MongoDB

MongoDB naturally stores nested weather documents but introduces another technology without providing a significant benefit for this use case.

The application already contains strongly related entities (cities, activities and recommendation rules), making PostgreSQL a better overall fit.

---

# 2. Persisting Forecasts as JSONB

## Decision

Weather forecasts are stored as a JSONB document inside the `cities` table instead of being normalized into forecast tables.

## Reasoning

The application always retrieves and refreshes the complete 7-day forecast together.

Typical operations are:

- Replace the entire forecast
- Read the entire forecast

There are currently no requirements to:

- Search historical forecasts
- Aggregate weather across cities
- Perform SQL analytics on weather data
- Query individual forecast days

Storing the forecast as JSONB keeps the model significantly simpler while avoiding unnecessary joins.

It also closely matches the response returned by the Open-Meteo API, reducing transformation logic.

## Trade-offs

### Advantages

- Simple schema
- Single database write per refresh
- Easy replacement of complete forecasts
- Flexible if the weather provider introduces new fields

### Disadvantages

- While PostgreSQL's JSONB combined with GIN indexes supports efficient querying of JSON documents, complex reporting, aggregations, joins and historical analytics are more naturally expressed with a normalized relational model.

- Historical weather analytics would require schema redesign.

---

# 3. Persisting Weather Instead of Calling the API Per Request

## Decision

Weather forecasts are persisted in PostgreSQL and reused across requests.

The weather provider is contacted only when the persisted forecast has expired.

## Reasoning

Calling the weather provider on every request would introduce:

- Higher response latency
- Increased dependency on a third-party service
- Higher API usage
- Reduced overall system availability

Persisting weather enables recommendation requests to be served almost entirely from local data.

---

# 4. Configurable Refresh Interval Per City

## Decision

Each city stores its own refresh interval.

## Reasoning

Different cities may require different refresh frequencies depending on expected traffic or business requirements.

Example:

| City | Refresh Interval |
|------|------------------|
| Mumbai | 2 hours |
| London | 6 hours |

Making this configuration data-driven allows refresh behaviour to evolve without changing application code.

---

# 5. Scheduler Driven Weather Refresh

## Decision

Weather synchronization is handled by a background scheduler instead of refreshing every city continuously.

Each city stores:

- `weatherData`
- `lastRequestedAt`
- `lastRefreshedAt`
- `refreshIntervalMinutes`

## Reasoning

Refreshing every configured city on every scheduler execution would generate unnecessary third-party API calls.

Instead, the scheduler refreshes only cities that satisfy **both** conditions:

1. The city has been requested recently (`lastRequestedAt` falls within the configured active window).
2. The persisted forecast has expired based on `refreshIntervalMinutes`.

A city's forecast is considered stale when:

```text
lastRefreshedAt + refreshIntervalMinutes <= current time
```

This approach provides several benefits:

- Reduces unnecessary Open-Meteo API calls.
- Keeps actively used cities fresh.
- Supports different refresh frequencies per city.
- Makes refresh behaviour configurable through data rather than code.
- Scales efficiently as the number of supported cities increases.

Although this behaves similarly to a lazy-refresh cache, the weather data is persisted in PostgreSQL instead of being stored in memory. This allows forecasts to survive application restarts and be shared across multiple application instances.

---

# 6. Database Driven Recommendation Rules

## Decision

Recommendation rules are stored in the database and evaluated by a generic rule engine instead of implementing a separate Strategy class for every activity.

## Reasoning

The recommendation logic is configuration-driven rather than activity-driven.

Every activity is evaluated using the same weather factors:

- Temperature
- Wind Speed
- Precipitation Probability
- Weather Condition

Only the configured thresholds and scores differ.

For example:

- Skiing prefers snow and lower temperatures.
- Surfing prefers moderate wind and warmer temperatures.
- Outdoor sightseeing prefers pleasant weather.

Since the evaluation algorithm remains identical for every activity, implementing a Strategy Pattern would duplicate logic while providing little additional value.

Instead, a generic rule engine evaluates database-configured rules for every activity.

This provides several advantages:

- New activities can be introduced by inserting database records.
- Existing recommendation rules can be adjusted without redeployment.
- Business users could eventually manage recommendation rules through an administration interface.
- The scoring algorithm remains centralized and easy to maintain.

A Strategy Pattern would become appropriate only if different activities required fundamentally different scoring algorithms rather than different rule values.

---

# 7. Generic Rule Engine

## Decision

A single rule engine evaluates every activity.

Supported comparison operators include:

- MIN
- MAX
- RANGE
- IN

## Reasoning

Instead of writing activity-specific logic such as:

```text
if skiing...
if surfing...
if sightseeing...
```

all activities are evaluated using the same algorithm.

Only the configured rules change.

This makes recommendation behaviour data-driven rather than code-driven.

---

# 8. Vendor Independent Weather Conditions

## Decision

Open-Meteo weather codes are mapped into business-specific weather conditions before entering the recommendation engine.

Example:

```text
95 -> THUNDERSTORM

71 -> SNOW

0 -> CLEAR_SKY
```

## Reasoning

The recommendation engine should not depend on provider-specific numeric weather codes.

Mapping weather conditions provides:

- Readable business rules
- Cleaner recommendation logic
- Easier onboarding for developers
- Simpler migration to another weather provider

The remainder of the application remains independent of Open-Meteo terminology.

---

# 9. GraphQL Error Mapping

## Decision

Application exceptions are converted into consistent GraphQL error responses.

## Reasoning

Clients should receive predictable error structures regardless of where failures occur.

This avoids exposing framework-specific exceptions while allowing clients to react using stable application error codes.

---

# 10. Testing Strategy

## Decision

Priority was given to comprehensive unit tests instead of integration tests.

## Reasoning

Given the available time, focus was placed on validating the application's core business logic, including:

- Recommendation scoring
- Rule engine behaviour
- Weather refresh logic
- Scheduler behaviour
- Resolver behaviour

Integration testing was intentionally identified as a future enhancement.

---

# Summary

The overall architecture prioritises:

- Simplicity
- Maintainability
- Extensibility
- Configuration over hardcoded business logic
- Efficient use of external APIs
- Reduced coupling with the weather provider
- Persistent weather storage
- Scalable refresh strategy
