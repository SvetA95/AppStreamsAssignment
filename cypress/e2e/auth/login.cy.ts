import { LoginPage } from '../../support/pages';

describe('Authentication', () => {
  const loginPage = new LoginPage();

  it('logs in with valid credentials', { tags: '@smoke' }, () => {
    loginPage.login(
      Cypress.env('EMAIL') as string,
      Cypress.env('PASSWORD') as string,
    );
    cy.url().should('not.include', '/login');
  });

  it('stays on login page with invalid credentials', () => {
    loginPage.login('wrong@example.com', 'wrongpassword');
    loginPage.shouldShowError();
  });
});
