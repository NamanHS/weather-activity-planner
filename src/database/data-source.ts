// This is used to perform db migrations
import { DataSource } from 'typeorm';
import { existsSync, readFileSync } from 'fs';
import { join } from 'path';
import yaml from 'js-yaml';
import merge from 'lodash.merge';

function loadYaml(file: string) {
  if (!existsSync(file)) {
    return {};
  }

  const content = readFileSync(file, 'utf8').trim();

  if (!content) {
    return {};
  }

  return yaml.load(content) as Record<string, any>;
}

const env = process.env.NODE_ENV ?? 'local';

const configDir = join(process.cwd(), 'src', 'config');

const config = merge(
  {},
  loadYaml(join(configDir, 'application.yaml')),
  loadYaml(join(configDir, `application-${env}.yaml`)),
);

export default new DataSource({
  type: 'postgres',

  host: config.database.host,
  port: Number(config.database.port),
  username: config.database.username,
  password: config.database.password,
  database: config.database.database,

  synchronize: false,
  logging: config.database.logging ?? false,

  entities: [join(process.cwd(), 'src/**/*.entity.ts')],
  migrations: [join(process.cwd(), 'src/database/migrations/*.ts')],
});
