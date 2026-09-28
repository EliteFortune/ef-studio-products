# ADR-003 — deterministic evidence first

**Status:** Accepted

## Decision
Git state, exit codes, CI status, merge status and HTTP observations take precedence over LLM judgment. AI evaluation is optional and never turns UNKNOWN into PASS without evidence.
