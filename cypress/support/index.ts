import './commands';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const registerCypressGrep = require('@cypress/grep') as () => void;
registerCypressGrep();

Cypress.on('uncaught:exception', (err) => {
  // Suppress common Ant Design / third-party noise that isn't test-relevant
  const ignore = [/ResizeObserver loop/, /ChunkLoadError/];
  return !ignore.some((p) => p.test(err.message));
});
