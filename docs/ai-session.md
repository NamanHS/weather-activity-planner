# AI Assisted Development

This project was developed with assistance from ChatGPT (OpenAI GPT-5.5).

Rather than generating the project end-to-end, AI was used as an engineering assistant to validate ideas, discuss trade-offs, review implementations, and accelerate development.

---

# Areas Where AI Was Used

## Project Planning

Discussed:

- Overall architecture
- Module boundaries
- Entity design
- Scheduler strategy
- Weather persistence strategy
- Recommendation engine design

---

## Database Design

AI assisted with:

- Entity modelling
- PostgreSQL schema review
- JSONB vs normalized forecast storage
- Activity rule modelling

Final schema and relationships were reviewed and adjusted manually.

---

## Recommendation Engine

Used AI to explore:

- Rule evaluation approach
- Generic rule engine
- Database-driven rules
- Score and penalty model

Alternative designs such as the Strategy Pattern were evaluated before selecting a generic rule engine.

---

## Scheduler Design

Used AI to discuss:

- Background refresh strategies
- Active city refresh window
- Refresh interval handling
- Batch processing
- Failure isolation
- Retry strategy

---

## GraphQL API

Used AI for:

- GraphQL schema review
- DTO design
- Resolver validation
- Error handling

---

## Unit Testing

AI assisted in writing unit tests for:

- Recommendation Service
- Rule Engine
- City Service
- Scheduler Service
- Activity Service
- GraphQL Resolver

Tests were executed and corrected manually during development.

---

## Documentation

AI assisted in producing:

- README
- Architecture documentation
- Design decisions
- Recommendation engine documentation
- Assumptions
- ERD

The documentation was iteratively reviewed and refined before submission.

---

# Engineering Decisions Made Manually

Although AI accelerated development, the following decisions were made after evaluating multiple approaches:

- PostgreSQL over MongoDB and Redis
- JSONB instead of normalized forecast tables
- Database-driven recommendation rules
- Generic rule engine instead of Strategy Pattern
- Active-city scheduler
- Configurable refresh interval per city
- Vendor-independent weather conditions
- Retry strategy for Open-Meteo
- GraphQL error mapping

---

# Notes

AI was used as a collaborative engineering assistant rather than an autonomous code generator.

All architectural decisions, implementation choices, testing, and final review were performed manually.