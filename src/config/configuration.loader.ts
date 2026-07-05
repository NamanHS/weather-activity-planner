import { existsSync, readFileSync } from 'fs';
import { join } from 'path';

import yaml from 'js-yaml';
import merge from 'lodash.merge';

import { configurationSchema } from './configuration.schema';

function loadYaml(file: string) {
  const content = readFileSync(file, 'utf8').trim();

  if (!content) {
    return {};
  }

  return yaml.load(content) ?? {};
}

export default () => {
  const env = process.env.NODE_ENV ?? 'local';
  const configDirectory = join(process.cwd(), 'src', 'config');
  const defaultConfig = loadYaml(join(configDirectory, 'application.yaml'));
  const envFile = join(configDirectory, `application-${env}.yaml`);

  const environmentConfig = existsSync(envFile) ? loadYaml(envFile) : {};

  const configuration = merge({}, defaultConfig, environmentConfig);

  return configurationSchema.parse(configuration);
};
