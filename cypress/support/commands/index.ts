import { LoginPage } from '../pages';

declare global {
  namespace Cypress {
    interface Chainable {
      login(email?: string, password?: string): Chainable<void>;
      selectAll(): Chainable<JQuery<HTMLElement>>;
    }
  }
}

/**
 * Full UI login, session-cached so it only runs once per spec.
 */
Cypress.Commands.add('login', (
  email = Cypress.env('EMAIL') as string,
  password = Cypress.env('PASSWORD') as string,
) => {
  cy.session([email, password], () => {
    new LoginPage().login(email, password);
  }, {
    validate() {
      cy.getCookies().should('have.length.greaterThan', 0);
    },
  });
    cy.visit('/');
});

/**
 * Convenience: select all text in the current element (Ctrl+A).
 * Mirrors the .press('ControlOrMeta+a') pattern in the Playwright recording.
 */
Cypress.Commands.add('selectAll', { prevSubject: 'element' }, (subject) => {
  cy.wrap(subject).type('{selectall}');
  return cy.wrap(subject);
});
