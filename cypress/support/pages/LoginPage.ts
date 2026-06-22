export class LoginPage {
  private readonly emailInput = 'input[type="text"], input[type="email"]';
  private readonly passwordInput = 'input[type="password"]';

  login(email: string, password: string): this {
    cy.visit('/login');  // must be inside login() so session setup navigates
    cy.get(this.emailInput).first().clear().type(email);
    cy.get(this.passwordInput).clear().type(password, { log: false });
    cy.contains('button', 'Sign in').click();
    cy.url().should('not.include', '/login');
    return this;
  }

  shouldShowError(): this {
    cy.url().should('include', '/login');
    return this;
  }
}