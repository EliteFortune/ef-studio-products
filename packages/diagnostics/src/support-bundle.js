const SECRET_KEYS = /token|secret|password|authorization|api[_-]?key|credential/i;
const CONTENT_KEYS = /source|prompt|diff|document|conversation|fileContent|stdout|stderr/i;

export function sanitize(value) {
  if (Array.isArray(value)) return value.map(sanitize);
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.entries(value).map(([k,v]) => {
      if (SECRET_KEYS.test(k)) return [k,'[REDACTED]'];
      if (CONTENT_KEYS.test(k)) return [k,'[OMITTED]'];
      return [k,sanitize(v)];
    }));
  }
  return value;
}

export function createSupportBundle({ health, appVersion, os, recentErrors = [] }) {
  return sanitize({
    generatedAt:new Date().toISOString(),
    appVersion,
    os,
    health,
    recentErrors
  });
}
