export interface PartnerRowExpectations {
  address?: string;
  phone?: string;
  contactName?: string;
  services?: string[];
}

export class PartnersListPage {
  navigateViaMenu(): this {
    cy.contains('div', /^Partners$/).click();
    cy.url().should('include', 'partner');
    return this;
  }

  searchForPartner(name: string): this {
    cy.get('#search-partners').clear();
    cy.get('#search-partners').type(name);
    cy.contains('td', name).should('be.visible');
    return this;
  }

  /**
   * Open the action menu (three-dot icon) for a partner row by name.
   * Searches first so the row is found regardless of pagination/sort order.
   */
  openActionsForPartner(name: string): this {
    this.searchForPartner(name);
    cy.contains('td', name)
      .closest('tr')
      .find('img[alt="dots-icon"]')
      .click();
    return this;
  }

  clickEditForPartner(name: string): this {
    this.openActionsForPartner(name);
    cy.get('#edit-button').click();
    return this;
  }

  /**
   * Opens the partner detail page. 
   */
  openPartnerDetails(name: string): this {
    this.searchForPartner(name);
    cy.contains('td', name).closest('tr').find('td.testid-carColumn').click();
    cy.url().should('include', '/partners/details/');
    return this;
  }

  shouldContainPartner(name: string): this {
    this.searchForPartner(name);
    return this;
  }

  /**
   * Asserts the columns visible in the list table for a given partner row.
   * The app has no standalone partner detail page, so this is how the UI
   * itself surfaces persisted values (besides type/description, which
   * aren't rendered as columns and are verified via the API instead).
   */
  shouldShowPartnerRow(name: string, expected: PartnerRowExpectations): this {
    this.searchForPartner(name);
    cy.contains('td', name).closest('tr').within(() => {
      if (expected.address) cy.contains(expected.address);
      if (expected.phone) cy.contains(expected.phone);
      if (expected.contactName) cy.contains(expected.contactName);
      expected.services?.forEach((service) => cy.contains(service));
    });
    return this;
  }
}
