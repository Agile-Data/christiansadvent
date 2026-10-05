# christiansadvent: proposed verification methods

These methods are scenarios to perform, not passing-check claims. Choose isolated test data and follow existing repository runbooks. Do not start a local profile that migrates or mutates a shared database merely to validate these documentation changes. Record actual command/results, baseline, and human observations against IDs in the task run record.

## CHRISTIANSADVENT-001

Method: manual.

Sign in as a new identity, create/join an Advent calendar, and verify no household or household membership was implicitly created.

Status: unrun; implementation support has not been assessed by this onboarding.

## CHRISTIANSADVENT-002

Method: test.

Use member/nonmember identities and calendar-timezone boundary cases; verify locked/future content is absent from serialized reader responses.

Status: unrun; implementation support has not been assessed by this onboarding.

## CHRISTIANSADVENT-003

Method: review.

Inspect lane Auth0/API configuration and BFF routes; verify no cross-domain cookie sharing, email-based account auto-linking, or browser API tokens.

Status: unrun; implementation support has not been assessed by this onboarding.
