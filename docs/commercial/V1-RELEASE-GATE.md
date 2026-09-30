# Agent Reliability V1 — Release Gate

Status: RELEASE HARDENING / FEATURE FREEZE

## Scope freeze
No new V1 product features are permitted unless required to remediate a release-blocking defect, security issue, licensing defect, installer defect, or data-loss risk.

## Proven in repository/CI
- deterministic verification engine and false-completion detection
- local persisted run history and diagnostics
- bounded recovery and last-known-good state
- perpetual-use/update-entitlement semantics
- signed-manifest and SHA-256 artifact verification primitives
- update rollback primitive
- CycloneDX SBOM generation
- Electron desktop/tray shell
- NSIS Windows packaging
- Windows CI installer artifact generation
- self-service activation UX/client boundary

## External production gates
V1 MUST NOT be published as commercially production-ready until all gates below are evidenced.

### G1 — Windows code signing
Owner action required: provision an organization-controlled Windows code-signing certificate or managed signing service.

Evidence:
- production installer is Authenticode signed
- signer identity matches EliteFortune release identity
- signature validates on a clean Windows machine
- private signing material is not committed to source control

### G2 — License activation service
Owner action required: provision the production HTTPS activation endpoint used by `EF_LICENSE_API_URL`.

Minimum contract:
- accepts product identifier + license key
- returns only the entitlement required by the local client
- supports revocation without collecting source code/prompts/customer project content
- rate limiting and abuse controls enabled
- secrets remain server-side

Evidence:
- valid key activation PASS
- invalid/revoked key PASS
- update-expired perpetual entitlement remains usable PASS
- endpoint unavailable does not destroy an already-valid local entitlement PASS

### G3 — Signed update transport
Production update metadata and artifacts must be distributed over HTTPS and verified by the application's pinned public-key/integrity controls before installation.

Evidence:
- valid signed update PASS
- tampered manifest FAIL CLOSED
- tampered artifact FAIL CLOSED
- failed post-update health check ROLLBACK PASS

### G4 — Clean Windows smoke test
Use a clean supported Windows VM with no development dependencies.

Evidence:
- install PASS
- first launch PASS
- tray launch/reopen PASS
- activation PASS
- local verification PASS
- diagnostics bundle PASS
- restart/persistence PASS
- uninstall PASS
- no customer source/prompt content transmitted by default PASS

### G5 — Release candidate
Only after G1–G4 pass:
- version bump and immutable tag
- release notes
- installer checksum
- SBOM
- third-party license inventory
- signed installer
- release evidence retained

## Stop condition
Do not create a public V1 release/tag merely because CI is green. CI currently proves the unsigned build path; G1–G4 prove commercial production readiness.
