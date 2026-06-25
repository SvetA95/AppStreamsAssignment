import { defineConfig } from 'cypress';

export default defineConfig({
  reporter: 'cypress-mochawesome-reporter',
  reporterOptions: {
    reportDir: 'cypress/reports',
    // UI and API specs run as two separate `cypress run` invocations (so
    // video can be disabled for just the API one). Both must land in one
    // combined report: `cypressParallel` stops the pre-run cleanup wiping
    // results from the other invocation, `removeJsonsFolderAfterMerge`
    // stops the post-run cleanup doing the same, and `overwrite` makes each
    // invocation's merge replace the same index.html rather than version a
    // new file.
    cypressParallel: true,
    removeJsonsFolderAfterMerge: false,
    overwrite: true,
    html: true,
    json: true,
    charts: true,
    embeddedScreenshots: true,
    inlineAssets: true,
  },

  // Global (not e2e-scoped) so a per-run `--config video=false` override
  // isn't shadowed by a more specific e2e.video value taking precedence.
  retries: { runMode: 1, openMode: 0 },
  defaultCommandTimeout: 10000,
  pageLoadTimeout: 30000,
  viewportWidth: 1440,
  viewportHeight: 900,
  video: true,
  screenshotOnRunFailure: true,
  // The UI and API specs run as two separate `cypress run` invocations that
  // both contribute to one merged report (see reporterOptions below). By
  // default Cypress trashes screenshots/videos at the start of every
  // invocation, which would delete the first invocation's screenshot before
  // the second invocation's merge step re-reads it. `npm run clean` clears
  // both folders once per `npm run cy:run`, so this is safe to disable.
  trashAssetsBeforeRuns: false,

  e2e: {
    baseUrl: 'https://dev.admin.avtoikonom.com',
    // e2e/ = browser journeys, api/ = pure cy.request contract tests —
    // kept as siblings rather than nesting API specs under "e2e".
    specPattern: ['cypress/e2e/**/*.cy.ts', 'cypress/api/**/*.cy.ts'],
    supportFile: 'cypress/support/index.ts',
    fixturesFolder: 'cypress/fixtures',
    videosFolder: 'cypress/videos',
    screenshotsFolder: 'cypress/screenshots',
    experimentalModifyObstructiveThirdPartyCode: false,

    setupNodeEvents(on, config) {
      // eslint-disable-next-line @typescript-eslint/no-var-requires -- no typed subpath export to import
      require('cypress-mochawesome-reporter/plugin')(on);

      // `||` (not `??`): CI sets these env vars to "" rather than leaving
      // them unset when a secret isn't configured, and "" must still fall
      // back to the default — nullish coalescing wouldn't catch that.
      config.env.EMAIL    = process.env.CYPRESS_EMAIL    || config.env.EMAIL;
      config.env.PASSWORD = process.env.CYPRESS_PASSWORD || config.env.PASSWORD;
      config.env.API_URL  = process.env.CYPRESS_API_URL  || config.env.API_URL;
      return config;
    },
  },

  env: {
    EMAIL:    'test_qa_ex@example.com',
    PASSWORD: 'test_qa_ex@example.com',
    API_URL:  'https://dev.api.avtoikonom.com',
  },
});
