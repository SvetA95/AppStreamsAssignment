export interface PartnerFormData {
  name?: string;
  type?: string;
  address?: string;
  phone?: string;
  contactName?: string;
  description?: string;
}

export class PartnerFormPage {
  fillName(value: string): this {
    cy.get('input[placeholder="Write partner name"]').clear();
    cy.get('input[placeholder="Write partner name"]').type(value);
    return this;
  }

  selectType(value: string): this {
    cy.get('.ant-select.ant-select-borderless.ant-select-multiple > .ant-select-selector').click();
    cy.contains('.ant-select-item-option', value).click();
    cy.contains('div', /^Edit partner$/).click();
    return this;
  }

  fillAddress(value: string): this {
    cy.get('input[placeholder="Enter a location"]').clear();
    cy.get('input[placeholder="Enter a location"]').type(value);
    cy.contains('Bulgaria').eq(3).click();
    return this;
  }

  fillPhone(value: string): this {
    cy.get('#phone-field').clear();
    cy.get('#phone-field').type(value);
    return this;
  }

  fillContactName(value: string): this {
    cy.get('input[placeholder="Names of contact person"]').clear();
    cy.get('input[placeholder="Names of contact person"]').type(value);
    return this;
  }

  fillDescription(value: string): this {
    cy.get('textarea[placeholder="Write description"]').clear();
    cy.get('textarea[placeholder="Write description"]').type(value);
    return this;
  }

  fill(data: PartnerFormData): this {
    if (data.name !== undefined)        this.fillName(data.name);
    if (data.type !== undefined)        this.selectType(data.type);
    if (data.address !== undefined)     this.fillAddress(data.address);
    if (data.phone !== undefined)       this.fillPhone(data.phone);
    if (data.contactName !== undefined) this.fillContactName(data.contactName);
    if (data.description !== undefined) this.fillDescription(data.description);
    return this;
  }

  save(): this {
    cy.contains('button', 'Save').eq(1).click();
    return this;
  }

  cancel(): this {
    cy.contains('button', 'Cancel').click();
    return this;
  }
}