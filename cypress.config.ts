import { defineConfig } from 'cypress';

export default defineConfig({
  reporter: 'cypress-mochawesome-reporter',
  reporterOptions: {
    reportDir: 'cypress/reports',
    // UI and API specs run as two separate `cypress run` invocations (so
    // video can be disabled for just the API one).
    cypressParallel: true,
    removeJsonsFolderAfterMerge: false,
    overwrite: true,
    html: true,
    json: true,
    charts: true,
    embeddedScreenshots: true,
    inlineAssets: true,
  },

  retries: { runMode: 1, openMode: 0 },
  defaultCommandTimeout: 10000,
  pageLoadTimeout: 30000,
  viewportWidth: 1440,
  viewportHeight: 900,
  video: true,
  screenshotOnRunFailure: true,
  trashAssetsBeforeRuns: false,

  e2e: {
    baseUrl: 'https://dev.admin.avtoikonom.com',
    specPattern: ['cypress/e2e/**/*.cy.ts', 'cypress/api/**/*.cy.ts'],
    supportFile: 'cypress/support/index.ts',
    fixturesFolder: 'cypress/fixtures',
    videosFolder: 'cypress/videos',
    screenshotsFolder: 'cypress/screenshots',
    experimentalModifyObstructiveThirdPartyCode: false,

    setupNodeEvents(on, config) {
      // eslint-disable-next-line @typescript-eslint/no-var-requires -- no typed subpath export to import
      require('cypress-mochawesome-reporter/plugin')(on);

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
