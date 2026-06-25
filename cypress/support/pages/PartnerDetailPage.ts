export class PartnerDetailPage {
  shouldDisplayName(name: string): this {
    cy.get('#partner-name-value').should('contain.text', name);
    return this;
  }

  shouldDisplayType(type: string): this {
    cy.get('#service-value').should('contain.text', type);
    return this;
  }

  shouldDisplayPhone(phone: string): this {
    cy.get('#phone-number-value').should('contain.text', phone);
    return this;
  }

  shouldDisplayContactName(contactName: string): this {
    cy.get('#user-name-value').should('contain.text', contactName);
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

  shouldDisplayService(service: string): this {
    cy.get('#partner-services-card').should('contain.text', service);
    return this;
  }

  openEditForm(): this {
    cy.get('#partner-details-card').find('img[alt="dots-icon"]').click();
    cy.get('#edit-button').click();
    return this;
  }
}
