# Windows Distribution

## V1 packaging
Agent Reliability is packaged as an Electron desktop application with:
- local EF Runtime/server
- desktop Console
- system tray resident mode
- per-user local data directory
- NSIS installer

## Signing
Pull-request artifacts are intentionally unsigned. Commercial releases must use an organization-controlled Windows code-signing certificate/private key through protected release secrets or a managed signing service. Private signing material must never be committed to this repository.

## Activation
The desktop app calls the configured `EF_LICENSE_API_URL` to exchange a license key for an entitlement. The raw license key is not persisted by the app; only the returned entitlement is stored locally.

## Release blocker
A public commercial V1 must not be advertised as signed or auto-updating until production code signing and the production activation/update endpoints are provisioned and smoke-tested.
