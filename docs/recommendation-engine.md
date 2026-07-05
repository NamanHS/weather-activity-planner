# Recommendation Engine

## Overview

The recommendation engine evaluates every activity independently against the weather forecast for each day.

Each activity consists of one or more configurable weather rules.

Every rule contributes either positively or negatively towards the activity's final recommendation score.

Once all activities have been evaluated, they are ranked in descending order of score and returned to the client.

This design keeps the recommendation engine completely data-driven while allowing new activities to be introduced without changing application code.

---

# Rule Structure

Each rule consists of:

- **Weather Factor**
- **Comparison Type**
- **Comparison Value(s)**
- **Score**
- **Penalty**

Example:

```text
Weather Factor : Temperature
Comparison     : MAX
Value          : 0°C
Score          : 30
Penalty        : 0
```

```text
Weather Factor : Weather Condition
Comparison     : IN
Value          : SNOW
Score          : 50
Penalty        : 100
```

```text
Weather Factor : Wind Speed
Comparison     : MAX
Value          : 40 km/h
Score          : 20
Penalty        : 20
```

---

# Supported Weather Factors

The current implementation supports:

- Temperature
- Wind Speed
- Precipitation Probability
- Weather Condition

The rule engine can easily be extended with additional weather factors in the future.

---

# Supported Comparison Operators

The rule engine currently supports four comparison operators.

## MIN

The weather value must be greater than or equal to the configured value.

Example

```text
Temperature >= 20°C
```

---

## MAX

The weather value must be less than or equal to the configured value.

Example

```text
Wind Speed <= 30 km/h
```

---

## RANGE

The weather value must fall within the configured range.

Example

```text
18°C <= Temperature <= 28°C
```

---

## IN

The weather value must exist within the configured list.

Example

```text
Weather Condition IN
[
    CLEAR_SKY,
    PARTLY_CLOUDY
]
```

---

# Scoring Algorithm

Each activity starts with an initial score of **0**.

Every configured rule is evaluated independently.

If a rule is satisfied:

```text
score += rule.score
```

Otherwise:

```text
score -= rule.penalty
```

After all rules have been evaluated:

```text
finalScore = max(score, 0)
```

The final score is never allowed to become negative.

Activities are then sorted in descending order of score.

---

# Example

## Skiing

Configured Rules

```text
Rule:
Temperature <= 0°C

Result:
+30
```

```text
Rule:
Weather Condition = SNOW

Result:
+50
```

```text
Rule:
Wind Speed <= 40 km/h

Result:
+20
```

Final Score

```text
30 + 50 + 20 = 100
```

---

## Surfing

Configured Rules

```text
Rule:
Temperature between 20°C and 35°C

Result:
+25
```

```text
Rule:
Wind Speed between 15 and 35 km/h

Result:
+35
```

```text
Rule:
Precipitation Probability <= 40%

Result:
+20
```

```text
Rule:
Weather Condition = CLEAR_SKY

Result:
+20
```

Possible Score

```text
100
```

---

# Why Penalty Instead of an "isMandatory" Flag?

One possible design would be to introduce an additional field:

```text
isMandatory = true
```

where failure to satisfy a mandatory rule would immediately make an activity ineligible.

Instead, this implementation intentionally models every rule using only **Score** and **Penalty**.

This keeps the rule engine simple and avoids introducing additional branching logic.

Mandatory-like behaviour can still be achieved by assigning a sufficiently large penalty.

For example, skiing without snow is generally not possible.

Instead of introducing:

```text
isMandatory = true
```

the rule can simply be configured as:

```text
Rule:
Weather Condition = SNOW

Score:
50

Penalty:
100
```

If the condition is not met:

```text
score -= 100
```

Since the final score is clamped to zero:

```text
finalScore = max(score, 0)
```

the activity naturally becomes one of the lowest-ranked recommendations without requiring any special handling inside the recommendation engine.

This approach keeps all recommendation behaviour configuration-driven while allowing business users to control how strongly each rule influences the ranking.

---

# Activity Ranking

Every activity is evaluated independently using the same generic rule engine.

The API returns activities sorted by descending score.

Example

```text
1. Surfing                 Score: 100

2. Outdoor Sightseeing     Score: 80

3. Indoor Sightseeing      Score: 30

4. Skiing                  Score: 0
```

---

# Benefits of this Approach

This design provides several advantages:

- Activities are fully configuration-driven.
- New activities can be added by inserting database records.
- Existing recommendation logic can be tuned without changing application code.
- Business rules remain centralized in the database.
- The recommendation engine remains generic and easy to maintain.
- Mandatory-like behaviour can be achieved through configurable penalties without introducing additional rule types or branching logic.