export class PartnersListPage {
  private readonly partnersNavItem = 'div:contains("Partners")';

  navigateViaMenu(): this {
    // The nav item is a div with exact text "Partners"
    cy.contains('div', /^Partners$/).click();
    cy.url().should('include', 'partner');
    return this;
  }

  /**
   * Open the action menu (three-dot icon) for a partner row by name.
   */
  openActionsForPartner(name: string): this {
    cy.contains('td', name)
      .closest('tr')
      .find('img[alt="dots-icon"]')
      .click();
    return this;
  }

  clickEditForPartner(name: string): this {
    this.openActionsForPartner(name);
    cy.contains('Edit').click();
    return this;
  }

  shouldContainPartner(name: string): this {
    cy.contains(name).should('be.visible');
    return this;
  }
}
