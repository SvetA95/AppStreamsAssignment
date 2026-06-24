export interface PartnerFormData {
  name?: string;
  type?: string;
  address?: string;
  phone?: string;
  contactName?: string;
  description?: string;
  services?: string[];
  subscriptionTier?: string;
}

export class PartnerFormPage {
  /**
   * AntD Select fields render a virtualized option list, so for fields with
   * many options (services, subscription tier) we type into the search box
   * to filter down to the match.
   */
  private selectAntOption(fieldId: string, value: string): void {
    cy.get(`#${fieldId}`).closest('.ant-select-selector').click();
    // The dropdown's own option panel can transiently overlap the search
    // input while it positions itself, so the visibility check is forced.
    cy.get(`#${fieldId}`).type(value, { force: true });
    cy.contains('.ant-select-item-option', value).click();
  }

  fillName(value: string): this {
    cy.get('#name-field').clear();
    cy.get('#name-field').type(value);
    return this;
  }

  selectType(value: string): this {
    this.selectAntOption('partner-type-field', value);
    return this;
  }

  selectServiceTypes(values: string[]): this {
    values.forEach((value) => this.selectAntOption('service-types-field', value));
    // Multi-select keeps its dropdown open after each pick; close it so it
    // doesn't overlap and block whatever field is interacted with next.
    cy.get('#name-field').click();
    return this;
  }

  selectSubscriptionTier(value: string): this {
    this.selectAntOption('subscription-tier-field', value);
    return this;
  }

  fillAddress(value: string): this {
    // The form requires an address picked from the Google Places suggestion
    // dropdown (free text alone fails validation with "Please choose an
    // address!"). The exact suggestion text doesn't matter, just that one
    // is selected, so we always take the first match for the typed value.
    cy.get('#address-field').clear();
    cy.get('#address-field').type(value);
    cy.get('.pac-item').first().click({ force: true });
    return this;
  }

  fillPhone(value: string): this {
    cy.get('#phone-field').clear();
    cy.get('#phone-field').type(value);
    return this;
  }

  fillContactName(value: string): this {
    cy.get('#contact-person-field').clear();
    cy.get('#contact-person-field').type(value);
    return this;
  }

  fillDescription(value: string): this {
    cy.get('#description-field').clear();
    cy.get('#description-field').type(value);
    return this;
  }

  uploadLogo(filePath: string): this {
    cy.get('input[name="file-upload"]').selectFile(filePath, { force: true });
    // Selecting a file opens an "Edit photo" cropper modal that must be
    // confirmed before the underlying form's own Save button is reachable.
    cy.contains('.ant-modal-content', 'Edit photo').within(() => {
      cy.contains('button', 'Save').click();
    });
    return this;
  }

  fill(data: PartnerFormData): this {
    if (data.name !== undefined) this.fillName(data.name);
    if (data.type !== undefined) this.selectType(data.type);
    if (data.services !== undefined) this.selectServiceTypes(data.services);
    if (data.subscriptionTier !== undefined) this.selectSubscriptionTier(data.subscriptionTier);
    if (data.address !== undefined) this.fillAddress(data.address);
    if (data.phone !== undefined) this.fillPhone(data.phone);
    if (data.contactName !== undefined) this.fillContactName(data.contactName);
    if (data.description !== undefined) this.fillDescription(data.description);
    return this;
  }

  save(): this {
    cy.get('#save-button').click();
    return this;
  }

  cancel(): this {
    cy.get('#cancel-button').click();
    return this;
  }
}
