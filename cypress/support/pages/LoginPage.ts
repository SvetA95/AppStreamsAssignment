export class LoginPage {
  private readonly emailInput = 'input[autocomplete="email"], input[type="email"]';
  private readonly passwordInput = 'input[type="password"]';

  login(email: string, password: string): this {
    // Force English so text-based selectors are deterministic regardless of
    // the app's locale default (observed to be Bulgarian on a fresh profile).
    cy.visit('/login', {
      onBeforeLoad(win) {
        win.localStorage.setItem('locale', JSON.stringify({ locale: 'en' }));
      },
    });
    cy.get(this.emailInput).first().clear();
    cy.get(this.emailInput).first().type(email);
    cy.get(this.passwordInput).clear();
    cy.get(this.passwordInput).type(password, { log: false });
    cy.get('button[type="submit"]').click();
    return this;
  }

  shouldShowError(): this {
    cy.url().should('include', '/login');
    return this;
  }
}