export const CriterionStatus = Object.freeze({ PASS: 'PASS', FAIL: 'FAIL', UNKNOWN: 'UNKNOWN' });
export const MissionStatus = Object.freeze({ VERIFIED: 'VERIFIED', FAILED: 'FAILED', INCOMPLETE: 'INCOMPLETE', UNKNOWN: 'UNKNOWN' });

export function createMission({ id, title, objective, repository, criteria, requiredProof = [] }) {
  if (!id || !title || !objective || !repository) throw new Error('mission requires id, title, objective, repository');
  if (!Array.isArray(criteria) || criteria.length === 0) throw new Error('mission requires at least one criterion');
  return { id, title, objective, repository, criteria, requiredProof, schemaVersion: 1, createdAt: new Date().toISOString() };
}

export function createRun({ id, missionId, agent = null, claimedStatus = null, claimedSummary = null }) {
  if (!id || !missionId) throw new Error('run requires id and missionId');
  return { id, missionId, agent, claimedStatus, claimedSummary, schemaVersion: 1, startedAt: new Date().toISOString() };
}
