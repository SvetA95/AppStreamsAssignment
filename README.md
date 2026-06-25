# Partner E2E Automation

[![Cypress Tests](https://github.com/SvetA95/AppStreamsAssignment/actions/workflows/tests.yml/badge.svg)](https://github.com/SvetA95/AppStreamsAssignment/actions/workflows/tests.yml)

End-to-end test suite for the Partner management workflow on `https://dev.admin.avtoikonom.com`, built with [Cypress](https://www.cypress.io/) + TypeScript.

**[Latest test report](https://SvetA95.github.io/AppStreamsAssignment/)** — published by CI on every run, no artifact download needed.

## What's covered

- **Login** (`cypress/e2e/auth/login.cy.ts`) — valid and invalid credentials.
- **Create Partner** (`cypress/e2e/partners/create-partner.cy.ts`) — navigates to Partners, fills out the full form (name, type, services, subscription tier, address autocomplete, phone, contact, description, logo upload), saves, and validates persistence via the list row, the partner's detail page, and the API. Also captures a screenshot of the detail page.
- **Update Partner** (`cypress/e2e/partners/update-partner.cy.ts`) — opens an existing partner via the row action menu, edits it, validates the changes persisted, verifies Cancel discards changes, and verifies the edit form is also reachable from the partner detail page.
- **Partner API** (`cypress/api/partner-api.cy.ts`) — API-contract tests (create/update/persist via `cy.request`, plus an invalid-login negative case), independent of the UI.

## Install and run

```bash
npm install
npm run cy:open          # interactive runner
npm run cy:run           # full suite, headless (UI specs, then API specs)
npm run cy:run:ui        # only cypress/e2e (browser journeys)
npm run cy:run:api       # only cypress/api (cy.request contract tests, no video)
npm run cy:run:headed    # full suite, headed
npm run cy:run:partners  # only the partners specs
npm run lint
npm run typecheck
```

`npm run cy:run` is two separate Cypress invocations, not one — see [Architecture](#architecture) for why — but both land in a single merged report at `cypress/reports/index.html`.

### Configuration

Credentials and the API base URL have working defaults in `cypress.config.ts` for this assignment's test environment. Override them via environment variables (useful for CI secrets, or pointing at a different environment):

```bash
CYPRESS_EMAIL=... CYPRESS_PASSWORD=... CYPRESS_API_URL=... npm run cy:run
```

or via a local, git-ignored `cypress.env.json` (copy `cypress.env.json.example`).

## Project structure

```
cypress/
  e2e/                               # browser journeys
    auth/login.cy.ts                # login happy/sad path
    partners/create-partner.cy.ts   # create flow
    partners/update-partner.cy.ts   # edit flow
  api/                               # pure cy.request contract tests, no browser action
    partner-api.cy.ts
  fixtures/
    partner.json                    # UI test data + API seed data
    images/partner-logo.png         # sample upload used by both UI flows
  support/
    pages/
      LoginPage.ts                  # login form
      PartnersListPage.ts           # search, row actions, row-level assertions
      PartnerFormPage.ts            # create/edit form (shared by both flows)
      PartnerDetailPage.ts          # partner detail page assertions + edit-form entry point
    api/partnerApi.ts               # cy.request wrappers: login/create/update/get
    commands/index.ts               # cy.login() (session-cached)
    index.ts                        # global hooks, locale
.github/workflows/tests.yml         # CI: lint + typecheck, then UI + API specs, then publish the report
```

## Architecture

- **Page Object Model.** One class per screen/area. Selectors are centralized there; specs only call intention-revealing methods (`formPage.fillName(...)`, `listPage.clickEditForPartner(...)`).
- **Selectors target stable attributes.** Element `id`s (`#name-field`, `#partner-type-field`, `#save-button`, `#edit-button`, etc.) are preferred over text or class selectors, which are either locale-dependent or tied to the UI library's internal styling. The row action menu and the detail page's action menu share the same underlying dropdown component, so both are driven through the same stable `id`s rather than matching visible text.
- **API layer** (`cypress/support/api/partnerApi.ts`) — thin `cy.request` wrappers (`loginApi`, `createPartnerApi`, `updatePartnerApi`, `getPartnerApi`), used for:
  1. **Test data setup** — `update-partner.cy.ts` seeds a fresh, uniquely-named partner via the API in `beforeEach` rather than depending on a specific partner already existing in the shared dev environment, keeping tests independent and order-safe.
  2. **Persistence verification** — both UI specs intercept the create/update network call (`cy.intercept`) and follow up with a direct `GET` to assert the full persisted payload, including fields like `type`/`description` that the UI doesn't surface on the list view.
- **Session caching.** `cy.session()` (via the `cy.login()` custom command) caches the authenticated session across tests in a run. Its `validate()` checks the `auth` key in `localStorage`, since this app persists its JWT there rather than in cookies.
- **Locale pinned to English.** The app defaults to Bulgarian on a fresh browser profile, so `localStorage.locale` is seeded before each visit, keeping text-based assertions deterministic regardless of the runner's locale.
- **UI and API specs run as two Cypress invocations.** `video` is a whole-run setting in Cypress, not per-spec, so recording the API spec (pure `cy.request`, no browser action worth watching back) would mean either video for everything or nothing. `npm run cy:run` / CI instead run `cypress/e2e` and `cypress/api` separately, disabling video only for the latter. Both invocations still land in one combined report — `cypressParallel` and `removeJsonsFolderAfterMerge: false` in `cypress.config.ts`'s `reporterOptions` stop the reporter from wiping the first invocation's results before merging in the second.
- **CI.** `.github/workflows/tests.yml` runs lint + typecheck, then the UI and API specs, on every push/PR and on manual dispatch, with `concurrency` cancelling a superseded run if a branch is pushed to again mid-run. Videos, screenshots, and the HTML report all upload as downloadable artifacts, and the report is also published to GitHub Pages so it's viewable as a live page without downloading anything (link in the job summary and at the top of this README).
- **Reporting.** `cypress-mochawesome-reporter` produces a self-contained HTML report (`cypress/reports/index.html`) — pass/fail per test, durations, and failure screenshots inline — so a failure can be triaged without scrubbing through a video.

> Publishing to Pages requires a one-time repo setting: **Settings → Pages → Build and deployment → Source: GitHub Actions.** Without it the `deploy-report` job fails on its first run.

### Partner detail page

Partners have a standalone detail page (`/partners/details/{id}`, modeled by `PartnerDetailPage.ts`). Clicking a row's name cell does not navigate to it; navigation is triggered from the row's other cells (address, phone, contact person) — `PartnersListPage.openPartnerDetails()` targets the address cell.

Create-partner validation combines three layers: the list row (what a user scanning the table sees), the detail page (name, type, phone, contact, address, description, services — plus a screenshot), and a direct API `GET` (catches anything neither UI view renders). The detail page's own action menu also opens the same Edit drawer used elsewhere, giving partners a second entry point into editing, which the Update spec covers with a dedicated navigation-only test (it doesn't repeat the full update-and-verify flow already covered).

## Assumptions made

- **Subscription tier** is referenced by name in test data (`cypress/fixtures/partner.json`) against an existing record on the dev environment. Unlike Service Types, there's no UI for creating or editing tiers, so this isn't disposable test data the suite can seed for itself — it's a dependency on whatever fixed tiers already exist in the environment.

## Known limitations

- **No automated test-data cleanup.** A `DELETE /admin/partner/{uuid}` endpoint exists but is gated behind MFA verification — it returns `403` with `{"code":1003,"info":"mfa temp code is invalid"}` when called without one, and that code isn't obtainable through the API. Every run leaves a handful of clearly-named (`AutomationPartnerQA-*`, `ApiSeededPartner-*`) records in the shared dev environment. The detail page's action menu also exposes a "Delete" option (the list row's menu only offers "Edit"); whether that UI path is subject to the same MFA gate hasn't been verified. A production setup would use either a dedicated, regularly-reset test environment or a service-account/CI-only bypass for the MFA gate.
- **Dev environment is shared and has no reset.** Test data uses timestamp-suffixed names specifically to avoid colliding with this accumulation, rather than relying on cleanup.

## What I'd improve with more time

- Secure a service-account or MFA-bypass path for `DELETE`, and add real `afterEach` cleanup.
- Move the subscription-tier test data out of a fixture referencing a specific existing record, into a small test-data-setup script run once per environment.
- Extend coverage beyond the Partner workflow: Service Types is a separate, fully manageable entity (the Partner form only consumes it read-only via dropdown) and is a natural next candidate. The same applies more broadly — this suite deliberately scopes to the one workflow the assignment specifies, within a much larger admin system.
- Add visual/accessibility checks (axe) on the create/edit form, since it's complex enough to be a good candidate.
- Parallelize CI across spec files once the suite grows past what's comfortable in a single job, and introduce tagging (e.g. `@cypress/grep`) for a fast-feedback smoke subset at that point — not worth the added complexity at the current scale.
- Component/contract tests for the API layer against a mocked backend, to catch breaking API changes without needing the real dev environment at all.
