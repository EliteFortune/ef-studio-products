import fs from 'node:fs';
import path from 'node:path';

export function loadConfig(filePath) {
  const target = path.resolve(filePath);
  const raw = JSON.parse(fs.readFileSync(target, 'utf8'));
  return validateConfig(raw);
}

export function validateConfig(config) {
  if (!config || typeof config !== 'object') throw new Error('config must be an object');
  if (!config.repository || typeof config.repository !== 'string') throw new Error('config.repository is required');
  if (config.telemetry && config.telemetry.includeContent === true) throw new Error('content telemetry is not permitted in V1');
  return {
    repository: config.repository,
    github: config.github ?? null,
    telemetry: {
      enabled: config.telemetry?.enabled ?? true,
      includeContent: false
    }
  };
}
