# Agent Reliability UX Spec

## Primary surfaces
1. Background runtime — normal operation should not require an open dashboard.
2. Tray — system health, recent verification, needs-attention count.
3. Console — setup, integrations, run history, evidence, system health, settings.
4. CLI — automation/technical workflows.
5. GitHub status/check — when GitHub is connected.

## Console navigation
- Home
- Runs
- Verification
- Integrations
- System Health
- Settings

## Status language
Use: Verified, Needs attention, Failed, Could not verify.
Avoid exposing confidence/engine jargon on the primary screen.

## Progressive disclosure
Summary -> criterion details -> raw evidence/diagnostics.

## Brand
Subtle EliteFortune identity; product function should dominate visual hierarchy. Support light/dark themes using one token system.
