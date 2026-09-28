# Illustrated content and reusable traditions

## Local review

Create a **new** calendar for each presentation you want to review. New calendars use `christmas-family-v2`; existing door text is never replaced automatically. The narratives are original editorial drafts based on the established family cast and scenes, ready for the family's review.

- Seasonal: family story and practical activity.
- Nativity: scripture references, reflection, and activity.
- Both: family story, activity, and scripture reflection.
- General Christian, Latter-day Saint, Catholic, and Protestant choices select suggested religious gatherings only for Nativity/Both. These are household planning suggestions, not official denominational calendars.

Open **Edit doors** to select a library illustration. Open **Plan traditions** for Black Friday, the Sunday-before-Christmas family gathering, Christmas Eve, and the selected tradition's devotional/service/party. A church party or service begins unscheduled. The LDS devotional's first-Sunday rule is a planning default that the owner must check against the announced date.

Annual rules and date overrides are separate. Clearing an override restores the rule. Multiple gatherings can share a date without overwriting a daily door. Gathering readings are locked until their own date in the calendar's timezone; unscheduled readings cannot be opened. Owners can preview all content in the editor.

**Reuse saved plan** copies saved text, publication state, illustrations, and annual rules to a new calendar. It recomputes annual dates and clears year-specific overrides. It does not copy invitations, members, or opened-door history. Old calendars and edits stay intact. Existing calendars can add suggested gatherings from the empty planner; this is idempotent.

## Private artwork publication

Seven existing assets are mapped in `art/advent-catalog.json`. The six family scenes and the crafting scene are reused; this does not claim 25 unique illustrations. Source assets remain unchanged.

The shared API reads `familiator.celebrations.bucket` / `CELEBRATIONS_S3_BUCKET`. It signs only catalog-approved private keys under `celebrations/advent/`, after owner or unlocked-reading authorization. URLs expire after five minutes; already issued URLs remain usable for that short lifetime following revocation. Door/gathering metadata never includes image URLs or future reading text. Refresh/reopen a reading if its image URL expires.

Apply API migration V21 before publishing the catalog. From this repository:

```sh
python3 scripts/publish-advent-artwork.py --bucket PRIVATE_BUCKET --profile agile-dev --sql-output /tmp/advent-artwork.sql
# Inspect the prepared assets and SQL, then upload:
python3 scripts/publish-advent-artwork.py --bucket PRIVATE_BUCKET --profile agile-dev --sql-output /tmp/advent-artwork.sql --apply
```

The macOS script preserves versioned PNG originals and makes 1600-pixel JPEG display copies with `sips`. `--apply` verifies all four S3 public-access blocks and uploads encrypted objects. Apply the generated SQL with the configured migration role, then set the bucket configuration and restart the API. The runtime role needs `s3:GetObject` on this prefix. No bucket or IAM policy is made public by this tool. A dry run emits SQL but does not upload; do not apply that SQL until the upload succeeds.

Published to the user-selected private bucket `agile-dev-878021512734-us-east-1-an`. All seven originals and display images were uploaded; their catalog rows were registered in the Dev database after V21, and `familiator-api-local` now has `CELEBRATIONS_S3_BUCKET` configured. The local API on 8083 was restarted and its health check passed. Production publication and runtime IAM remain part of deployment. Missing images do not block readings.

## Acceptance review

1. Review new calendars in Seasonal, Nativity, and Both, including the selected faith's gatherings.
2. Select artwork on a daily door; save and reopen it. Verify alt text and narrow-screen layout.
3. Choose the ward-party date, override the devotional date, and restore an annual rule.
4. Reuse the saved plan for another year; verify moved Sundays, cleared party dates, preserved edits, and new invitations.
5. With two real accounts: create, invite, join, open an eligible door and gathering, edit, revoke, and verify the same records in Familiator.
6. Confirm that guests cannot preview future readings or browse the image library.

Local H2 and mocked browser checks do not replace Auth0, PostgreSQL, live S3, or the two-account acceptance walkthrough. No commits or pushes are part of this pass.
