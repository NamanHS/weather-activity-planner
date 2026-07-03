## Database Migrations

### Create a new migration

Creates an empty migration file.

```bash
npm run migration:create -- src/database/migrations/<MigrationName>
```

**Example**

```bash
npm run migration:create -- src/database/migrations/CreateCityTable
```

---

### Run migrations

Applies all pending migrations to the database.

```bash
npm run migration:run
```

---

### Revert the last migration

Rolls back the most recently applied migration.

```bash
npm run migration:revert
```

---

### Show migration status

Displays all migrations and indicates which have been executed and which are pending.

```bash
npm run migration:show
```

---

### Recommended workflow

1. Create a new migration.

```bash
npm run migration:create -- src/database/migrations/<MigrationName>
```

2. Implement the `up()` and `down()` methods in the generated migration.

3. Apply the migration.

```bash
npm run migration:run
```

4. If required, revert the last applied migration.

```bash
npm run migration:revert
```
