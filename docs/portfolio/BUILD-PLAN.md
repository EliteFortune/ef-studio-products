# Agent Reliability V1 Build Plan

## M0 Product baseline
Canonical PRD, scope, non-goals, ADRs, architecture, support/update/privacy policy.

## M1 Runtime foundation
Shared contracts, local persistence boundary, config, event model.

## M2 Verification engine
Criterion evaluators, evidence records, verdict semantics, false-completion fixture.

## M3 Git/local verification
Repository/branch/commit/file assertions and trusted local evidence.

## M4 Tests/custom commands
Trusted config-only command execution, bounded output, timeout, pass/fail evidence.

## M5 GitHub/CI
PR/merge/check/commit evidence with graceful offline/unavailable behavior.

## M6 Surfaces
CLI first, then minimal Console + tray + GitHub result/status surface.

## M7 Self-service reliability
Health checks, error codes, reconnect/rebuild/restore flows, sanitized diagnostics.

## M8 Update/licensing/release
Entitlement adapter, signed artifact/update manifest, health-check/rollback path, release checks, SBOM/license inventory.

## Release gate
V1 cannot ship unless the false-completion demo is detected, local verification works without GitHub, diagnostics cover core dependencies, telemetry does not leak source content, and release artifacts are versioned and validated.
