# Production License Service

V1 activation is hosted on the existing EliteFortune `ef-identity` Supabase project.

## Endpoint
`https://nmckntmhjhajehixyoau.supabase.co/functions/v1/ef-license-activate`

The desktop application may override this with `EF_LICENSE_API_URL`, but the production endpoint above is the default.

## Data minimization
The service stores:
- SHA-256 license-key hash
- product identifier
- entitlement/update period
- SHA-256 local installation identifier
- activation timestamps
- bounded user-agent metadata
- hashed source IP for short-window abuse throttling

It does not receive or store customer source code, prompts, diffs, documents, repository contents, agent conversations, or API credentials.

## Security
- raw license keys are never stored in the database
- device identity is a random per-install UUID, not a hardware fingerprint
- RLS is enabled on licensing tables
- activation mutation is exposed only to the server-side role
- public Edge Function performs its own validation and rate limiting
- activation limit is enforced atomically in PostgreSQL

## Smoke evidence
Database-level smoke validation proved:
- valid key -> entitlement
- invalid key -> `LICENSE_INVALID`
- first three distinct installations accepted for a 3-device license
- fourth distinct installation -> `ACTIVATION_LIMIT_REACHED`

Synthetic smoke license data was deleted after validation.
