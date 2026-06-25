import { defineConfig } from 'cypress';

export default defineConfig({
  reporter: 'cypress-mochawesome-reporter',
  reporterOptions: {
    reportDir: 'cypress/reports',
    overwrite: false,
    html: true,
    json: true,
    charts: true,
    embeddedScreenshots: true,
    inlineAssets: true,
  },

  e2e: {
    baseUrl: 'https://dev.admin.avtoikonom.com',
    specPattern: 'cypress/e2e/**/*.cy.ts',
    supportFile: 'cypress/support/index.ts',
    fixturesFolder: 'cypress/fixtures',
    videosFolder: 'cypress/videos',
    screenshotsFolder: 'cypress/screenshots',
    experimentalModifyObstructiveThirdPartyCode: false,

    retries: { runMode: 1, openMode: 0 },

    defaultCommandTimeout: 10000,
    pageLoadTimeout: 30000,

    viewportWidth: 1440,
    viewportHeight: 900,

    video: true,
    screenshotOnRunFailure: true,

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
