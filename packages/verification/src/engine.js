import { MissionStatus, CriterionStatus } from '../../core/src/contracts.js';
import { verifyFileExists, verifyTextContains, verifyCommand } from './verifiers.js';

const handlers = { fileExists: verifyFileExists, textContains: verifyTextContains, command: verifyCommand };

export function deriveMissionVerdict(results) {
  if (results.length === 0) return MissionStatus.UNKNOWN;
  if (results.some(r => r.status === CriterionStatus.FAIL)) return MissionStatus.FAILED;
  if (results.some(r => r.status === CriterionStatus.UNKNOWN)) return MissionStatus.INCOMPLETE;
  if (results.every(r => r.status === CriterionStatus.PASS)) return MissionStatus.VERIFIED;
  return MissionStatus.UNKNOWN;
}

export function verifyMission(mission) {
  const results = mission.criteria.map(criterion => {
    const handler = handlers[criterion.type];
    if (!handler) return { criterionId: criterion.id, status: CriterionStatus.UNKNOWN, evidence: [], explanation: `Unsupported criterion type: ${criterion.type}` };
    try { return handler(mission.repository, criterion); }
    catch (error) { return { criterionId: criterion.id, status: CriterionStatus.UNKNOWN, evidence: [], explanation: error.message }; }
  });
  return {
    missionId: mission.id,
    verifiedStatus: deriveMissionVerdict(results),
    criterionResults: results,
    createdAt: new Date().toISOString()
  };
}
