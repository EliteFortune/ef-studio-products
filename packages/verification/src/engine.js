import { MissionStatus, CriterionStatus } from '../../core/src/contracts.js';
import {
  verifyFileExists,
  verifyTextContains,
  verifyCommand,
  verifyGitBranch,
  verifyGitClean,
  verifyGitCommit,
  verifyGitChangedFile,
  verifyGitHubPrMerged,
  verifyGitHubStatusSuccess
} from './verifiers.js';

const handlers = {
  fileExists: verifyFileExists,
  textContains: verifyTextContains,
  command: verifyCommand,
  gitBranch: verifyGitBranch,
  gitClean: verifyGitClean,
  gitCommit: verifyGitCommit,
  gitChangedFile: verifyGitChangedFile,
  githubPrMerged: verifyGitHubPrMerged,
  githubStatusSuccess: verifyGitHubStatusSuccess
};

export function deriveMissionVerdict(results) {
  if (results.length === 0) return MissionStatus.UNKNOWN;
  const mandatory = results.filter(r => r.mandatory !== false);
  if (mandatory.some(r => r.status === CriterionStatus.FAIL)) return MissionStatus.FAILED;
  if (mandatory.some(r => r.status === CriterionStatus.UNKNOWN)) return MissionStatus.INCOMPLETE;
  if (mandatory.length && mandatory.every(r => r.status === CriterionStatus.PASS)) return MissionStatus.VERIFIED;
  return MissionStatus.UNKNOWN;
}

export async function verifyMission(mission, options = {}) {
  if (!Array.isArray(mission.criteria) || mission.criteria.length === 0) {
    return { missionId: mission.id, verifiedStatus: MissionStatus.UNKNOWN, criterionResults: [], createdAt: new Date().toISOString() };
  }

  const context = { commandRegistry: options.commandRegistry ?? {}, githubClient: options.githubClient ?? null };
  const results = await Promise.all(mission.criteria.map(async criterion => {
    const handler = handlers[criterion.type];
    if (!handler) {
      return {
        criterionId: criterion.id,
        mandatory: criterion.mandatory !== false,
        status: CriterionStatus.UNKNOWN,
        evidence: [],
        contradictions: [],
        missingEvidence: [`Unsupported criterion type: ${criterion.type}`],
        explanation: `Unsupported criterion type: ${criterion.type}`
      };
    }
    try {
      return { mandatory: criterion.mandatory !== false, contradictions: [], missingEvidence: [], ...(await handler(mission.repository, criterion, context)) };
    } catch (error) {
      return {
        criterionId: criterion.id,
        mandatory: criterion.mandatory !== false,
        status: CriterionStatus.UNKNOWN,
        evidence: [],
        contradictions: [],
        missingEvidence: [error.message],
        explanation: error.message
      };
    }
  }));

  return {
    missionId: mission.id,
    claimedStatus: mission.claimedStatus ?? null,
    verifiedStatus: deriveMissionVerdict(results),
    criterionResults: results,
    createdAt: new Date().toISOString()
  };
}
