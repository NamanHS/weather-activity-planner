import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialSchema1783088633581 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TYPE weather_factor AS ENUM (
                'TEMPERATURE',
                'WIND_SPEED',
                'PRECIPITATION_PROBABILITY',
                'CONDITION'
            );
        `);

        await queryRunner.query(`
            CREATE TYPE comparison_type AS ENUM (
                'MIN',
                'MAX',
                'RANGE',
                'IN'
            );
        `);

        await queryRunner.query(`
            CREATE TABLE cities (
                id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
                name VARCHAR(100) NOT NULL,
                country_code VARCHAR(2) NOT NULL,
                latitude DECIMAL(9,6) NOT NULL,
                longitude DECIMAL(9,6) NOT NULL,
                timezone VARCHAR(100) NOT NULL,
                weather_data JSONB,
                refresh_interval_minutes INTEGER NOT NULL,
                last_refreshed_at TIMESTAMPTZ,
                last_requested_at TIMESTAMPTZ,
                created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
                CONSTRAINT uq_city_name_country_code UNIQUE (name, country_code)
            );
        `);

        await queryRunner.query(`
            CREATE INDEX idx_city_last_requested_at
            ON cities(last_requested_at);
        `);

        await queryRunner.query(`
            CREATE INDEX idx_city_last_refreshed_at
            ON cities(last_refreshed_at);
        `);

        await queryRunner.query(`
            CREATE TABLE activities (
                id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
                name VARCHAR(100) NOT NULL UNIQUE,
                description TEXT,
                created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
            );
        `);

        await queryRunner.query(`
            CREATE TABLE activity_weather_rules (
                id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
                activity_id INTEGER NOT NULL,
                weather_factor weather_factor NOT NULL,
                comparison_type comparison_type NOT NULL,
                value_from NUMERIC(10,2),
                value_to NUMERIC(10,2),
                -- Stores comparison values for IN rules.
                -- Examples:
                -- ["SNOW"]
                -- ["RAIN","HEAVY_RAIN"]
                -- ["CLEAR","PARTLY_CLOUDY"]
                comparison_values JSONB,
                score INTEGER NOT NULL,
                penalty INTEGER NOT NULL DEFAULT 0,
                created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
                CONSTRAINT fk_activity_weather_rules_activity
                    FOREIGN KEY (activity_id)
                    REFERENCES activities(id)
                    ON DELETE CASCADE,
                CONSTRAINT chk_activity_weather_rule_comparison_values
                    CHECK (
                        (
                            comparison_type IN ('MIN', 'MAX')
                            AND value_from IS NOT NULL
                            AND value_to IS NULL
                            AND comparison_values IS NULL
                        )
                        OR
                        (
                            comparison_type = 'RANGE'
                            AND value_from IS NOT NULL
                            AND value_to IS NOT NULL
                            AND comparison_values IS NULL
                        )
                        OR
                        (
                            comparison_type = 'IN'
                            AND comparison_values IS NOT NULL
                            AND jsonb_typeof(comparison_values) = 'array'
                            AND value_from IS NULL
                            AND value_to IS NULL
                        )
                    )
            );
        `);

        await queryRunner.query(`
            CREATE INDEX idx_activity_weather_rules_activity_id
            ON activity_weather_rules(activity_id);
        `);

    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            DROP INDEX IF EXISTS idx_activity_weather_rules_activity_id;
        `);

        await queryRunner.query(`
            DROP TABLE IF EXISTS activity_weather_rules;
        `);

        await queryRunner.query(`
            DROP TABLE IF EXISTS activities;
        `);

        await queryRunner.query(`
            DROP INDEX IF EXISTS idx_city_last_requested_at;
        `);

        await queryRunner.query(`
            DROP INDEX IF EXISTS idx_city_last_refreshed_at;
        `);

        await queryRunner.query(`
            DROP TABLE IF EXISTS cities;
        `);

        await queryRunner.query(`
            DROP TYPE IF EXISTS comparison_type;
        `);

        await queryRunner.query(`
            DROP TYPE IF EXISTS weather_factor;
        `);
    }

}
