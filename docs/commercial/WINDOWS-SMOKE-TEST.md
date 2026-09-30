# Clean Windows V1 Smoke Protocol

Record release version, commit SHA, Windows version, VM image identifier, tester, date, installer SHA-256, and signer before execution.

| ID | Test | Expected |
|---|---|---|
| W01 | Verify installer Authenticode signature | Valid EliteFortune release signer |
| W02 | Verify published SHA-256 | Exact match |
| W03 | Install as standard user | Completes without development tooling |
| W04 | Launch from Start Menu | Console opens and local runtime starts |
| W05 | Close window | App remains available through tray |
| W06 | Reopen from tray | Existing runtime/console reopens |
| W07 | Health page | Local runtime/store health visible |
| W08 | Activate valid license | Entitlement persisted; raw key not retained |
| W09 | Restart app | Valid entitlement remains available |
| W10 | Run verification | Result persists into Runs history |
| W11 | Export diagnostics | Sanitized diagnostics file generated |
| W12 | Disconnect network | Existing perpetual entitlement remains usable |
| W13 | Apply valid signed update | Signature/integrity accepted |
| W14 | Present tampered update | Update rejected before install |
| W15 | Simulate failed post-update health | Last-known-good version restored |
| W16 | Uninstall | Application removed cleanly |
| W17 | Privacy check | No source code, prompts, diffs, documents, credentials, or agent conversations transmitted by default |

## Release decision
Any failure in W01–W17 is a release blocker unless explicitly classified as non-applicable with documented rationale. Do not waive signing, integrity, rollback, activation, uninstall, or privacy failures.
