# EF Studio Products Architecture

## Principle
One monorepo, one shared runtime, modular commercial products.

## V1 runtime
```text
AI coding agent -> Git/local repo -> GitHub/CI -> EF Runtime -> Verification -> Verdict
                                              -> Tray/CLI/Console/GitHub status
```

## Shared platform packages
- core contracts/events/config
- verification engine
- Git integration
- GitHub integration
- diagnostics/health/recovery
- updater
- licensing/entitlements

## Product boundary
Agent Reliability must function without a deep Claude/Codex/Cursor integration. Agent-specific integrations are optional surfaces, not hard dependencies.

## Technology direction
V1 favors a single TypeScript/JavaScript stack to minimize solo-founder maintenance. Desktop shell may use Electron or Tauri later; runtime logic lives in shared packages so future cloud/self-hosted surfaces can reuse it.

## Data
Local SQLite or equivalent local persistence. Customer source/evidence remains local by default.
