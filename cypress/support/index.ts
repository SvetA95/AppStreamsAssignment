import 'cypress-mochawesome-reporter/register';
import './commands';

Cypress.on('uncaught:exception', (err) => {
  const ignore = [/ResizeObserver loop/, /ChunkLoadError/];
  return !ignore.some((p) => p.test(err.message));
});
