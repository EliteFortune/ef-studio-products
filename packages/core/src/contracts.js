export const CriterionStatus = Object.freeze({ PASS: 'PASS', FAIL: 'FAIL', UNKNOWN: 'UNKNOWN' });
export const MissionStatus = Object.freeze({ VERIFIED: 'VERIFIED', FAILED: 'FAILED', INCOMPLETE: 'INCOMPLETE', UNKNOWN: 'UNKNOWN' });

export function createMission({ id, title, objective, repository, criteria }) {
  if (!id || !title || !objective || !repository) throw new Error('mission requires id, title, objective, repository');
  if (!Array.isArray(criteria) || criteria.length === 0) throw new Error('mission requires at least one criterion');
  return { id, title, objective, repository, criteria };
}
