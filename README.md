# Partner E2E Automation

[![Cypress Tests](https://github.com/SvetA95/AppStreamsAssignment/actions/workflows/tests.yml/badge.svg)](https://github.com/SvetA95/AppStreamsAssignment/actions/workflows/tests.yml)

This is an end-to-end test suite for the Partner management workflow on `https://dev.admin.avtoikonom.com`, created with [Cypress](https://www.cypress.io/) and TypeScript.

**[Latest test report](https://SvetA95.github.io/AppStreamsAssignment/)** is published by CI with every run.

## What's covered

- **Login** (`cypress/e2e/auth/login.cy.ts`) covers valid and invalid credentials.
- **Create Partner** (`cypress/e2e/partners/create-partner.cy.ts`) navigates to Partners, fills out the full form (name, type, services, subscription tier, address autocomplete, phone, contact, description, logo upload), saves, and checks persistence via the list row, the partner's detail page, and the API. It also captures a screenshot of the detail page.
- **Update Partner** (`cypress/e2e/partners/update-partner.cy.ts`) opens an existing partner through the row action menu. It edits the information, checks that the changes persisted, verifies that Cancel discards changes, and confirms the edit form is reachable from the partner detail page.
- **Partner API** (`cypress/api/partner-api.cy.ts`) includes API tests for creating, updating, and checking persistence via `cy.request`, plus an invalid-login negative case that is independent of the UI.

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

`npm run cy:run` consists of two separate Cypress invocations. See [Architecture](#architecture) for clarification. Both land in a single merged report at `cypress/reports/index.html`.

### Configuration

Credentials and the API base URL have working defaults in `cypress.config.ts` for this assignment's test environment. You can override them using environment variables, which is helpful for CI secrets or pointing to a different environment:

```bash
CYPRESS_EMAIL=... CYPRESS_PASSWORD=... CYPRESS_API_URL=... npm run cy:run
```

You can also use a local, git-ignored `cypress.env.json` (copy `cypress.env.json.example`).

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

- **Page Object Model.** There is one class per screen/area. Selectors are centralized; specs only call clear methods like `formPage.fillName(...)` and `listPage.clickEditForPartner(...)`.
- **Selectors target stable attributes.** Element `id`s (`#name-field`, `#partner-type-field`, `#save-button`, `#edit-button`, etc.) are preferred. This avoids issues with text or class selectors, which can change based on locale or UI library styling. The row action menu and the detail page's action menu both use the same stable `id`s instead of matching visible text.
- **API layer** (`cypress/support/api/partnerApi.ts`) consists of simple `cy.request` wrappers (`loginApi`, `createPartnerApi`, `updatePartnerApi`, `getPartnerApi`). They are used for:
  1. **Test data setup:** The `update-partner.cy.ts` file seeds a fresh, uniquely-named partner via the API in `beforeEach` to keep tests independent and safe from order issues.
  2. **Persistence verification:** UI specs intercept the create/update network call (`cy.intercept`) and then make a direct `GET` request to verify the full persisted payload, including fields like `type`/`description` that do not appear in the list view.
- **Session caching.** `cy.session()` (using the `cy.login()` command) caches the authenticated session across tests in a run. Its `validate()` checks the `auth` key in `localStorage` because this app saves its JWT there, not in cookies.
- **Locale is set to English.** The app defaults to Bulgarian in a fresh browser. Hence, `localStorage.locale` is set before each visit, ensuring text-based assertions are consistent regardless of the runner's locale.
- **UI and API specs run as two Cypress invocations.** The video option applies to the entire run in Cypress, not per spec. Recording the API spec (which only utilizes `cy.request` and has no valuable browser activity to watch) would require either video for everything or nothing. Instead, `npm run cy:run` and CI run `cypress/e2e` and `cypress/api` separately, disabling video for the API run. Merging the results into one report requires three settings to work together: `cypressParallel` and `removeJsonsFolderAfterMerge: false` (`reporterOptions`) prevent the reporter from wiping the first run's results before the second one merges in, and `trashAssetsBeforeRuns: false` stops Cypress from deleting the first run's screenshot before the merge. An explicit `npm run clean` is necessary to run just once at the start of `cy:run`.
- **CI.** The `.github/workflows/tests.yml` file runs linting and typechecking, then UI and API specs on each push/PR and manual dispatch. It uses `concurrency` to cancel any previous runs if new code is pushed while a run is ongoing. Videos, screenshots, and the HTML report are all uploaded as downloadable files. The report is also published to GitHub Pages, allowing it to be viewed live without downloading anything (link in the job summary and at the top of this README).
- **Reporting.** The `cypress-mochawesome-reporter` creates a self-contained HTML report (`cypress/reports/index.html`) showing pass/fail status per test, durations, and inline failure screenshots. This allows for quick triaging of failures without having to sift through a video.
### Partner detail page

Partners have a separate detail page located at `/partners/details/{id}`, created by `PartnerDetailPage.ts`. Clicking a row's name cell does not navigate to this page; navigation happens when clicking other cells (address, phone, contact person). The method `PartnersListPage.openPartnerDetails()` focuses on the address cell.

Create-partner validation combines three layers: the list row (what a user sees in the table), the detail page (name, type, phone, contact, address, description, services — plus a screenshot), and a direct API `GET` (to catch anything not rendered by the UI). The detail page's action menu also allows access to the same Edit drawer used elsewhere, giving partners another way to edit, which the Update spec tests with a dedicated navigation-only test (without repeating the full update-and-verify flow).

## Assumptions made

- **Subscription tier** is referenced by name in the test data (`cypress/fixtures/partner.json`) against an existing record in the dev environment. Unlike Service Types, there is no UI for creating or editing tiers. Thus, this test data cannot be set up by the suite itself — it depends on whatever fixed tiers already exist in the environment.

## Known limitations

- **No automated test-data cleanup.** A `DELETE /admin/partner/{uuid}` endpoint is available but requires MFA verification. When called without MFA, it returns `403` with `{"code":1003,"info":"mfa temp code is invalid"}`. This means every run leaves some clearly-named records (`AutomationPartnerQA-*`, `ApiSeededPartner-*`) in the shared dev environment. The detail page's action menu also has a "Delete" option, though it's unclear if that UI path faces the same MFA gate. A production setup would use either a dedicated, regularly-reset test environment or a CI-only bypass for the MFA.
- **Dev environment is shared and cannot be reset.** Test data uses timestamp-suffixed names to avoid conflicting with this accumulation instead of relying on cleanup.

## What I'd improve with more time

- Secure a service account or MFA-bypass option for `DELETE` and implement real cleanup in `afterEach`.
- Move the subscription-tier test data out of a fixture that references a specific existing record into a small setup script that runs once per environment.
- Extend coverage beyond the Partner workflow. Service Types is a separate entity (the Partner form only reads it through dropdowns) and would be a natural next candidate. This applies more broadly since this suite focuses on the one workflow specified in the assignment, within a larger admin system.
- Add visual and accessibility checks (axe) on the create/edit form, as it's complex enough to warrant it.
- Parallelize CI across spec files once the suite grows beyond what fits comfortably in a single job, and introduce tagging (e.g., `@cypress/grep`) for a fast-feedback smoke subset, considering the current scale doesn't warrant the added complexity.
- Create component or contract tests for the API layer against a mocked backend to identify breaking API changes without needing the real dev environment.