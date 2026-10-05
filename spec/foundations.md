# christiansadvent: foundational agreements

<!-- foundry-draft -->

Repository: Agile-Data/christiansadvent. Solution: Familiator (user-confirmed inventory).

This is documentation-only onboarding, recorded on 2026-10-04. Existing repository rules and indexed product documents remain authoritative. The extracted requirements are a documented subset, not a complete release baseline or evidence that any behavior passed. Reconcile this draft before setting ready.

## Company technology defaults

The user supplied these defaults: React and Next.js for web frontends, Spring
Boot 4 for new Java service work, next-intl for Next.js localization, Auth.js /
next-auth or Auth0 according to product need, and MUI including MUI Pro graphical
components. Preserve this repository's established versions, identity provider,
and native/runtime choices unless an authorized migration is in scope. These
defaults do not convert SwiftUI, Kotlin/Compose, Expo, WordPress, static sites,
or CDK products into another runtime.

Reuse common infrastructure/pipelines from github-actions, infrastructure, and
terraform where their inspected contracts apply. Shared Java capability modules
belong in agile-gradle and shared React/MUI primitives or feature packages in
agile-ui. The consuming product retains its own business workflows, authorization,
routing, tenant context, API adapters, and translations unless an existing shared
module explicitly owns them. Inventory names alone do not establish dependencies.

## Local-first delivery

Before committing or pushing, run the smallest useful local checks, let the human
test the affected workflow locally, and wait for explicit commit/push approval
unless immediate delivery was explicitly requested. Conserve hosted CI: do not
use commits, pushes, or GitHub Actions as the iterative test loop.

## Specification continuity

Read spec/manifest.json and every indexed foundation, product, architecture, and
requirements document before planning or building. Reconcile authorized changes
with foundational invariants; never silently rewrite them to match an accidental
implementation. Preserve stable requirement IDs and map plans, changes, actual
checks, and remaining gaps to those IDs. Temporary run records supplement the
tracked repository-owned specification. A draft is not build-ready; structural
validation is not proof of semantic completeness or passing behavior.

## Existing product invariants

- A standalone Advent user may create or join a calendar without creating a Familiator household. Source: `docs/architecture.md`.
- Reader access is calendar-authorized and server-date-gated; future door text is not downloaded to the reader. Source: `docs/architecture.md`.
- The Advent frontend retains a separate first-party session with server-only API tokens while using the matching Familiator identity directory and audience. Source: `docs/architecture.md`.
