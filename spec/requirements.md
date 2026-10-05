# christiansadvent: extracted requirements

<!-- foundry-draft -->

These stable IDs record only behavior stated by the inspected authoritative documents. The full indexed documents remain required reading. This subset has not been reconciled into a complete build-ready baseline. No runtime or human verification was run during onboarding.

## CHRISTIANSADVENT-001

A standalone Advent user may create or join a calendar without creating a Familiator household.

Source: `docs/architecture.md`.

Acceptance method: `spec/verification.md#christiansadvent-001`.

## CHRISTIANSADVENT-002

Reader access is calendar-authorized and server-date-gated; future door text is not downloaded to the reader.

Source: `docs/architecture.md`.

Acceptance method: `spec/verification.md#christiansadvent-002`.

## CHRISTIANSADVENT-003

The Advent frontend retains a separate first-party session with server-only API tokens while using the matching Familiator identity directory and audience.

Source: `docs/architecture.md`.

Acceptance method: `spec/verification.md#christiansadvent-003`.
