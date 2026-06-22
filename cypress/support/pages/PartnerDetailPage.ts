export class PartnerDetailPage {
  shouldDisplayName(name: string): this {
    cy.get('#partner-details-card').should('contain.text', name);
    return this;
  }

  shouldDisplayType(type: string): this {
    cy.get('#partner-details-card').should('contain.text', type);
    return this;
  }

  shouldDisplayPhone(phone: string): this {
    cy.get('#partner-details-card').should('contain.text', phone);
    return this;
  }

  shouldDisplayContactName(name: string): this {
    cy.get('#user-name-value').should('contain.text', name);
    return this;
  }

  shouldDisplayAddress(address: string): this {
    cy.get('#address-value').should('contain.text', address);
    return this;
  }

  shouldDisplayDescription(description: string): this {
    cy.get('#description-value').should('contain.text', description);
    return this;
  }

  openActionsMenu(): this {
    cy.get('img[alt="dots-icon"]').first().click();
    return this;
  }

  clickEdit(): this {
    this.openActionsMenu();
    cy.contains('Edit').click();
    return this;
  }
}
