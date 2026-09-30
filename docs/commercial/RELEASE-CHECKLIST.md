# Agent Reliability V1 Release Checklist

A release is not commercially ready until all applicable items are proven.

- [ ] exact release SHA CI green
- [ ] false-completion demo detects missing required proof
- [ ] all automated tests pass
- [ ] entitlement tests prove perpetual use survives update-expiry
- [ ] update manifest signature verification passes
- [ ] artifact SHA-256 verification passes
- [ ] failed post-update health check triggers rollback test
- [ ] CycloneDX SBOM generated
- [ ] third-party license inventory reviewed
- [ ] sanitized diagnostics excludes customer content/secrets
- [ ] Windows package produced and smoke-tested on supported Windows version
- [ ] update signing key is stored only in protected release secret storage
- [ ] version, release notes and support/update terms published

## V1 support boundary
30-day installation/activation assistance. Product defects may be reported after that window; bespoke project debugging is not included.
