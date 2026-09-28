import { randomUUID } from 'node:crypto';

export function createEvent(type, payload = {}) {
  if (!type) throw new Error('event type is required');
  return {
    eventId: randomUUID(),
    type,
    occurredAt: new Date().toISOString(),
    schemaVersion: 1,
    payload
  };
}
