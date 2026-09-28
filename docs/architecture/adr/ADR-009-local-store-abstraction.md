# ADR-009 — local store abstraction

**Status:** Accepted

## Decision
V1 persistence is behind a small local-store interface. The first implementation uses an atomic file-backed store to keep installation and native dependency complexity low. The interface is intentionally replaceable by SQLite when query volume, concurrency, or migration needs justify it.

## Rationale
At the solo-founder stage, a native SQLite dependency would add packaging and support surface before the product has validated usage. Persistence correctness and schema versioning matter now; database sophistication does not.

## Guardrail
No customer content leaves the local device as a consequence of this decision.
