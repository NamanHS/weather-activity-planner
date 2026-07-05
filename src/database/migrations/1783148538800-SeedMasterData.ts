import { MigrationInterface, QueryRunner } from 'typeorm';

export class SeedMasterData1783148538800 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {

    /**
     * Cities
     */

    await queryRunner.query(`
      INSERT INTO cities
      (
        name,
        country_code,
        latitude,
        longitude,
        timezone,
        refresh_interval_minutes
      )
      VALUES

      ('mumbai','IN',19.0760,72.8777,'Asia/Kolkata',120),

      ('london','GB',51.5072,-0.1276,'Europe/London',360),

      ('newyork','US',40.7128,-74.0060,'America/New_York',240),

      ('tokyo','JP',35.6762,139.6503,'Asia/Tokyo',240),

      ('sydney','AU',-33.8688,151.2093,'Australia/Sydney',240),

      ('dubai','AE',25.2048,55.2708,'Asia/Dubai',360),

      ('paris','FR',48.8566,2.3522,'Europe/Paris',360),

      ('singapore','SG',1.3521,103.8198,'Asia/Singapore',180),

      ('zurich','CH',47.3769,8.5417,'Europe/Zurich',360),

      ('vancouver','CA',49.2827,-123.1207,'America/Vancouver',360);
    `);

    /**
     * Activities
     */

    await queryRunner.query(`
      INSERT INTO activities
      (
        name,
        description
      )
      VALUES

      (
        'Skiing',
        'Snow based outdoor sport'
      ),

      (
        'Surfing',
        'Water sport performed on ocean waves'
      ),

      (
        'Outdoor Sightseeing',
        'Exploring attractions and landmarks outdoors'
      ),

      (
        'Indoor Sightseeing',
        'Museums, galleries, shopping malls and indoor attractions'
      );
    `);

    /**
     * Activity Weather Rules
     */

    await queryRunner.query(`
      INSERT INTO activity_weather_rules
      (
        activity_id,
        weather_factor,
        comparison_type,
        value_from,
        value_to,
        comparison_values,
        score,
        penalty
      )

      VALUES

      ------------------------------------------------------------------
      -- SKIING
      ------------------------------------------------------------------

      (
        (SELECT id FROM activities WHERE name='Skiing'),
        'TEMPERATURE',
        'MAX',
        0,
        NULL,
        NULL,
        30,
        0
      ),

      (
        (SELECT id FROM activities WHERE name='Skiing'),
        'CONDITION',
        'IN',
        NULL,
        NULL,
        '["SNOW","SNOW_SHOWERS"]'::jsonb,
        50,
        100
      ),

      (
        (SELECT id FROM activities WHERE name='Skiing'),
        'WIND_SPEED',
        'MAX',
        40,
        NULL,
        NULL,
        20,
        20
      ),

      ------------------------------------------------------------------
      -- SURFING
      ------------------------------------------------------------------

      (
        (SELECT id FROM activities WHERE name='Surfing'),
        'TEMPERATURE',
        'RANGE',
        20,
        35,
        NULL,
        25,
        0
      ),

      (
        (SELECT id FROM activities WHERE name='Surfing'),
        'WIND_SPEED',
        'RANGE',
        15,
        35,
        NULL,
        35,
        10
      ),

      (
        (SELECT id FROM activities WHERE name='Surfing'),
        'PRECIPITATION_PROBABILITY',
        'MAX',
        40,
        NULL,
        NULL,
        20,
        20
      ),

      (
        (SELECT id FROM activities WHERE name='Surfing'),
        'CONDITION',
        'IN',
        NULL,
        NULL,
        '["CLEAR","PARTLY_CLOUDY","OVERCAST"]'::jsonb,
        20,
        0
      ),

      ------------------------------------------------------------------
      -- OUTDOOR SIGHTSEEING
      ------------------------------------------------------------------

      (
        (SELECT id FROM activities WHERE name='Outdoor Sightseeing'),
        'TEMPERATURE',
        'RANGE',
        18,
        30,
        NULL,
        35,
        0
      ),

      (
        (SELECT id FROM activities WHERE name='Outdoor Sightseeing'),
        'PRECIPITATION_PROBABILITY',
        'MAX',
        20,
        NULL,
        NULL,
        30,
        30
      ),

      (
        (SELECT id FROM activities WHERE name='Outdoor Sightseeing'),
        'WIND_SPEED',
        'MAX',
        25,
        NULL,
        NULL,
        15,
        15
      ),

      (
        (SELECT id FROM activities WHERE name='Outdoor Sightseeing'),
        'CONDITION',
        'IN',
        NULL,
        NULL,
        '["CLEAR","PARTLY_CLOUDY","OVERCAST"]'::jsonb,
        20,
        0
      ),

      ------------------------------------------------------------------
      -- INDOOR SIGHTSEEING
      ------------------------------------------------------------------

      (
        (SELECT id FROM activities WHERE name='Indoor Sightseeing'),
        'TEMPERATURE',
        'RANGE',
        10,
        40,
        NULL,
        20,
        0
      ),

      (
        (SELECT id FROM activities WHERE name='Indoor Sightseeing'),
        'PRECIPITATION_PROBABILITY',
        'MIN',
        60,
        NULL,
        NULL,
        30,
        0
      ),

      (
        (SELECT id FROM activities WHERE name='Indoor Sightseeing'),
        'CONDITION',
        'IN',
        NULL,
        NULL,
        '["DRIZZLE","RAIN","HEAVY_RAIN","RAIN_SHOWERS","THUNDERSTORM"]'::jsonb,
        30,
        0
      ),

      (
        (SELECT id FROM activities WHERE name='Indoor Sightseeing'),
        'WIND_SPEED',
        'MIN',
        30,
        NULL,
        NULL,
        20,
        0
      );
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DELETE FROM activity_weather_rules
      WHERE activity_id IN (
        SELECT id
        FROM activities
        WHERE name IN (
          'Skiing',
          'Surfing',
          'Outdoor Sightseeing',
          'Indoor Sightseeing'
        )
      );
    `);

    await queryRunner.query(`
      DELETE FROM activities
      WHERE name IN (
        'Skiing',
        'Surfing',
        'Outdoor Sightseeing',
        'Indoor Sightseeing'
      );
    `);

    await queryRunner.query(`
      DELETE FROM cities
      WHERE (name, country_code) IN (
        ('Mumbai','IN'),
        ('London','GB'),
        ('New York','US'),
        ('Tokyo','JP'),
        ('Sydney','AU'),
        ('Dubai','AE'),
        ('Paris','FR'),
        ('Singapore','SG'),
        ('Zurich','CH'),
        ('Vancouver','CA')
      );
    `);
  }
}
