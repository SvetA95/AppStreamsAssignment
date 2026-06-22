# Partner E2E Test Suite

Cypress 13 + TypeScript. Tests the Partner management workflow on `https://dev.admin.avtoikonom.com`.

## Install & Run

```bash
npm install
npx cypress install   # downloads the Cypress binary (Windows: run as Admin if it hangs)

npm run cy:open        # interactive Test Runner
npm run cy:run         # headless
npm run cy:run:partners  # partners specs only
```

## Credentials

Stored in `cypress.env.json` (git-ignored). Copy the example file:

```bash
cp cypress.env.json.example cypress.env.json
```

In CI, set `CYPRESS_EMAIL` and `CYPRESS_PASSWORD` as environment secrets — they are automatically picked up by Cypress.

## Project Structure

```
cypress/
  e2e/
    auth/
      login.cy.ts               # login happy/sad path
    partners/
      create-partner.cy.ts      # create flow
      update-partner.cy.ts      # edit flow (translated from Playwright recording)
  fixtures/
    partner.json                # all test data in one place
  support/
    pages/
      LoginPage.ts              # input[type="login"], input[type="password"]
      PartnersListPage.ts       # nav, dots-icon action menu
      PartnerFormPage.ts        # all form fields + Ant Design select
      PartnerDetailPage.ts      # #partner-details-card, #user-name-value, etc.
    commands/
      index.ts                  # cy.login() (session-cached), cy.selectAll()
    index.ts                    # global hooks
```

## Assumptions & Known Gaps

- **Create flow**: no Playwright recording was available for Create. The create spec uses a best-guess button selector (`/new|add|create/i`). Run `npx playwright codegen https://dev.admin.avtoikonom.com`, click through creating a partner, and paste the output to get the exact selector.
- **Address autocomplete**: the recording clicks `.getByText('Bulgaria').nth(4)` — this is the 5th occurrence of "Bulgaria" on the page. Mapped to `.eq(3)` in Cypress (0-indexed). If the page content changes, this index may need adjusting.
- **Type dropdown**: uses Ant Design's `.ant-select-multiple`. The recording selects "Insurer"; the fixture uses "Service" for creates. Both use the same `selectType()` method.
- **Duplicate test data**: the update spec targets the existing `DemoName1` partner. In a CI environment you'd want API-level seeding/teardown to avoid depending on pre-existing data.
