# Product Requirements Document — EliteFortune Agent Reliability

**Status:** V1 FROZEN  
**Owner:** EliteFortune  
**Delivery model:** local-first, self-service commercial software  
**Primary buyer:** solo founders and small AI-native engineering teams using AI coding agents

## 1. Problem
AI coding agents frequently report completion without independent proof that every requested outcome is actually true. A merged PR, passing local test, or generated response is not equivalent to a verified technical outcome.

## 2. Product promise
**Independently verify that your AI coding agent actually finished the job.**

Agent Reliability remains agent-agnostic. Claude Code, Codex, Cursor, OpenCode, or another tool may produce the work; EF verifies evidence rather than trusting agent self-report.

## 3. Verdicts
- **VERIFIED** — every mandatory criterion is proven.
- **FAILED** — affirmative evidence proves at least one mandatory criterion failed.
- **INCOMPLETE** — required proof/completion is missing.
- **UNKNOWN** — EF cannot safely determine status.

UNKNOWN must never degrade to PASS.

## 4. Canonical objects

### MissionContract
- mission_id
- title
- objective
- acceptance_criteria[]
- repository
- branch
- required_proof[]
- optional deployment_target

### AgentClaim
- mission_id
- agent_name (optional)
- claimed_status
- claimed_summary
- timestamp

### Evidence
- evidence_id
- criterion_id
- type
- source
- observed_at
- payload/reference
- hash where appropriate

### CriterionResult
- criterion_id
- status: PASS | FAIL | UNKNOWN
- evidence[]
- contradictions[]
- missing_evidence[]
- explanation

### MissionVerdict
- mission_id
- claimed_status
- verified_status: VERIFIED | FAILED | INCOMPLETE | UNKNOWN
- criterion_results[]
- created_at

## 5. V1 verification capabilities

### Git/local repository
- branch exists
- commit exists
- working tree state
- changed file assertions
- file exists / missing
- text/pattern assertion

### Tests/custom commands
- configured command execution
- exit code
- duration
- bounded stdout/stderr capture
- pass/fail

Commands must originate from trusted customer configuration, never arbitrary remote/agent text.

### GitHub
- PR existence/state
- merge state
- commit SHA
- checks/CI status

### HTTP/API
- expected URL
- expected status
- optional JSON/text assertion
- timeout

## 6. User experience
EF runs as a lightweight local runtime with an on-demand console. Normal usage should not require the user to keep EF open. Results may appear through tray notifications, CLI, and GitHub checks. The console is for configuration, run history, evidence, diagnostics, and settings.

## 7. Self-service requirements
V1 includes:
- system health checks
- known-error codes
- reconnect flow for expired integration credentials
- safe local cache/index rebuild
- last-known-good configuration restore
- update rollback
- sanitized diagnostic bundle

Do not build an autonomous AI repair agent in V1.

## 8. Updates
- signed release manifests
- checksum/signature verification
- backup before migration/update
- post-update health check
- automatic rollback on failed health check
- stable release channel initially

Purchase includes access to eligible releases published during the first 12 months. This is not a promise of monthly feature releases.

## 9. Analytics/privacy
Permitted telemetry is allowlisted and content-minimized: product version, OS family, feature/event type, duration, success/failure category, error code, update result, crash metadata.

Do not collect source code, prompts, diffs, repository content, documents, agent conversations, credentials, or API keys as normal analytics.

## 10. Commercial model hypothesis
- self-service perpetual local license
- unlimited repositories/projects
- limited device activations
- commercial use permitted
- 12 months update eligibility
- 30 days installation/activation assistance
- optional paid update renewal after year one

Pricing remains a hypothesis until validated.

## 11. V1 acceptance criteria
1. A new local repository can be registered without manual DB editing.
2. A mission can define at least one mandatory acceptance criterion.
3. EF can execute trusted configured checks and persist evidence.
4. EF can detect a false-completion scenario where an agent claims DONE but a mandatory check fails.
5. Final verdict semantics match the PRD definitions.
6. GitHub evidence works when connected and local verification still works when GitHub is unavailable.
7. System Health identifies core runtime, repository, Git, storage, GitHub connection, and updater state.
8. Update workflow supports health validation and rollback design.
9. No customer source content is emitted in default telemetry.
10. Build/release pipeline produces test results and dependency/security artifacts.
