import { LoginPage } from '../pages';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Cypress {
    interface Chainable {
      login(email?: string, password?: string): void;
      selectAll(): Chainable;
    }
  }
}

Cypress.Commands.add('login', (
  email = Cypress.env('EMAIL') as string,
  password = Cypress.env('PASSWORD') as string,
) => {
  cy.session([email, password], () => {
    new LoginPage().login(email, password);
  }, {
    validate() {
      cy.window().its('localStorage').invoke('getItem', 'auth').should('exist');
    },
  });
  cy.visit('/');
});

Cypress.Commands.add('selectAll', { prevSubject: 'element' }, (subject) => {
  cy.wrap(subject).type('{selectall}');
  return cy.wrap(subject);
});