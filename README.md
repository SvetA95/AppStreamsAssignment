# Partner E2E Automation

End-to-end test suite for the Partner management workflow on `https://dev.admin.avtoikonom.com`, built with [Cypress](https://www.cypress.io/) + TypeScript.

## What's covered

- **Login** (`cypress/e2e/auth/login.cy.ts`) — valid and invalid credentials.
- **Create Partner** (`cypress/e2e/partners/create-partner.cy.ts`) — navigates to Partners, fills out the full form (name, type, services, subscription tier, address autocomplete, phone, contact, description, logo upload), saves, and validates persistence.
- **Update Partner** (`cypress/e2e/partners/update-partner.cy.ts`) — opens an existing partner via the row action menu, edits it, validates the changes persisted, and verifies Cancel discards changes.
- **Partner API** (`cypress/e2e/api/partner-api.cy.ts`) — pure API-contract tests (create/update/persist via `cy.request`, plus an invalid-login negative case), independent of the UI.

## Install and run

```bash
npm install
npm run cy:open          # interactive runner
npm run cy:run           # full suite, headless
npm run cy:run:headed    # full suite, headed
npm run cy:run:smoke     # only @smoke-tagged tests (fast critical-path subset)
npm run cy:run:partners  # only the partners specs
npm run lint
npm run typecheck
```

### Configuration

Credentials and the API base URL have working defaults baked into `cypress.config.ts` for this assignment's test environment. Override them either via environment variables (useful for CI secrets, or pointing at a different environment):

```bash
CYPRESS_EMAIL=... CYPRESS_PASSWORD=... CYPRESS_API_URL=... npm run cy:run
```

or via a local, git-ignored `cypress.env.json` (copy `cypress.env.json.example`).

## Project structure

```
cypress/
  e2e/
    auth/login.cy.ts                # login happy/sad path
    partners/create-partner.cy.ts   # create flow
    partners/update-partner.cy.ts   # edit flow
    api/partner-api.cy.ts           # API-only contract tests
  fixtures/
    partner.json                    # UI test data + API seed data
    images/partner-logo.png         # sample upload used by both UI flows
  support/
    pages/
      LoginPage.ts                  # login form
      PartnersListPage.ts           # search, row actions, row-level assertions
      PartnerFormPage.ts            # create/edit form (shared by both flows)
    api/partnerApi.ts               # cy.request wrappers: login/create/update/get
    commands/index.ts               # cy.login() (session-cached)
    index.ts                        # global hooks, locale, @cypress/grep registration
.github/workflows/cypress.yml       # CI: lint + typecheck, then smoke/full suite
```

## Architecture

- **Page Object Model** — one class per screen/area. All selectors are centralized here; specs only call intention-revealing methods (`formPage.fillName(...)`, `listPage.clickEditForPartner(...)`).
- **Selectors prioritize stable attributes** — real element `id`s discovered via DOM inspection (`#name-field`, `#partner-type-field`, `#save-button`, etc.) over text or class selectors, which are either locale-dependent or Ant Design implementation detail.
- **API layer** (`cypress/support/api/partnerApi.ts`) — thin `cy.request` wrappers (`loginApi`, `createPartnerApi`, `updatePartnerApi`, `getPartnerApi`). Used two ways:
  1. **Test data setup**: `update-partner.cy.ts` seeds a fresh, uniquely-named partner via the API in `beforeEach`, instead of depending on a specific partner already existing in the shared dev environment. This keeps tests independent and order-safe.
  2. **Persistence verification**: both UI specs intercept the create/update network call (`cy.intercept`) and follow up with a direct `GET` to assert the full persisted payload — including fields like `type`/`description` that the UI never renders back anywhere (see below).
- **Session caching** — `cy.session()` (via the `cy.login()` custom command) caches the authenticated session across tests in a run, with a `validate()` check against the `auth` key in `localStorage` (this app stores its JWT there, not in cookies).
- **Locale forced to English** — a fresh browser profile defaults this app to Bulgarian; we seed `localStorage.locale` before each visit so text-based assertions are deterministic regardless of the runner's default locale.
- **Tagged smoke subset** — `@cypress/grep` tags the three most critical happy-path tests as `@smoke` (login, create, update), runnable independently via `npm run cy:run:smoke` for fast feedback in CI before the full suite.
- **CI** — `.github/workflows/cypress.yml` runs lint + typecheck, then the smoke suite on every push/PR, with the full suite available via manual dispatch. Videos/screenshots upload as artifacts on failure.

### Why there's no "detail page" object

Partners don't have a standalone detail view to validate against in this app — clicking a list row does nothing, and visiting `/partners/{uuid}` directly just renders the list. All partner data is shown either in the list table's columns or inside the edit drawer. Validation is built around what actually exists:
- **List row assertions** (`PartnersListPage.shouldShowPartnerRow`) for what the UI itself displays to a user (name, address, phone, contact, services).
- **API `GET` assertions** for fields not rendered as list columns at all (`type`, `description`).

## Assumptions made

- **Type → API enum mapping**: the UI dropdown shows "Service"/"Insurer", but the wire value differs (confirmed via network capture that "Service" sends `type: "carService"`). The exact value for "Insurer" was never confirmed, so the Update test asserts internal consistency instead (whatever value the UI submits in the `PUT` request body is the value asserted via the follow-up `GET`), rather than hardcoding a guessed string.
- **Subscription tier / service type names** used as test data (`cypress/fixtures/partner.json`) reference real, pre-existing records on the dev environment, since there's no dedicated test-data API. In a real project these would come from a seeded, disposable test dataset rather than live-looking environment data.
- **Address validation**: per the assignment, address content itself doesn't need to be validated. The form does require a real Google Places suggestion to be selected (typed text alone fails validation), so the form helper always picks the first suggestion for whatever was typed — the *selection* is required for the form to be valid, the specific result isn't asserted on.
- **Phone field** auto-prepends a country code (`+359`) regardless of what's typed; assertions check the typed digits are a substring of the persisted value rather than an exact match.
- **Logo is a required field** on both create and update (discovered via a blocked save with a validation error), so a sample image is uploaded in both flows. Uploading opens an "Edit photo" cropper modal that must be confirmed before the form's own Save button is reachable.

## Known limitations

- **No test-data cleanup.** A `DELETE /admin/partner/{uuid}` endpoint exists but is gated behind MFA verification (confirmed directly: returns `403 {"code":1003,"info":"mfa temp code is invalid"}`), which isn't obtainable through the API. Every test run leaves a handful of clearly-named (`AutomationPartnerQA-*`, `ApiSeededPartner-*`) records behind on the shared dev environment — there's no way to delete them via automation. A real project would either use a dedicated, regularly-reset test environment, or a service-account/CI-only bypass for the MFA gate.
- **Dev environment is shared and has no reset.** Tests generate unique names (timestamp-suffixed) specifically to avoid collisions with this accumulated data, rather than relying on cleanup.

## What I'd improve with more time

- Get a service-account or MFA-bypass path for `DELETE`, and add real `afterEach` cleanup.
- Move the subscription-tier/service-type test data out of a fixture referencing specific existing records, into a small test-data-setup script run once per environment.
- Add visual/accessibility checks (axe) on the create/edit form, since it's complex enough to be a good candidate.
- Parallelize CI across spec files once the suite grows past what's comfortable in a single job.
- Component/contract tests for the API layer against a mocked backend, to catch breaking API changes without needing the real dev environment at all.
