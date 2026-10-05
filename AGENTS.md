<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->


## Product Foundry specification

Read `spec/manifest.json` and all indexed foundational, product, architecture,
and requirements documents before planning or building. Preserve their invariants
and stable requirement IDs; map actual verification results to each affected ID.
Reconcile missing or draft specs before dependent implementation. Run notes do
not replace the tracked spec, and structural validation does not prove behavior.
Follow `spec/foundations.md` and the existing local-first delivery agreement.
