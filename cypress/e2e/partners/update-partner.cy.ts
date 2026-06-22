/**
 * Update Partner workflow.
 *
 * Direct Cypress translation of the Playwright codegen recording.
 * Uses "DemoName1" as the target partner (as recorded).
 */
import { PartnersListPage, PartnerFormPage, PartnerDetailPage } from '../../support/pages';
import type { PartnerFormData } from '../../support/pages';

describe('Update Partner', () => {
  const listPage = new PartnersListPage();
  const formPage = new PartnerFormPage();
  const detailPage = new PartnerDetailPage();
  let updated: PartnerFormData;

  before(() => {
    cy.fixture('partner').then((f) => { updated = f.updatedPartner; });
  });

  beforeEach(() => {
    cy.login();
    listPage.navigateViaMenu();
  });

  it('opens the edit form via the row action menu', () => {
    listPage.clickEditForPartner('DemoName1');
    cy.contains('Edit partner').should('be.visible');
  });

  it('updates partner fields and validates changes are persisted', () => {
    listPage.clickEditForPartner('DemoName1');

    formPage
      .fillName(updated.name!)
      .selectType('Insurer')          // matches the recording
      .fillAddress(updated.address ?? 'Sofia, Bulgaria')
      .fillPhone(updated.phone!)
      .fillContactName(updated.contactName!)
      .fillDescription(updated.description!);

    formPage.save();

    // Validate detail card reflects saved values
    detailPage.shouldDisplayName(updated.name!);
    detailPage.shouldDisplayType('Insurer');
    detailPage.shouldDisplayPhone(updated.phone!);
    detailPage.shouldDisplayContactName(updated.contactName!);
    detailPage.shouldDisplayAddress('Sofia, Bulgaria');
    detailPage.shouldDisplayDescription(updated.description!);
  });

  it('cancel discards changes and returns to the list', () => {
    listPage.clickEditForPartner('DemoName1');
    formPage.fillName('ShouldNotBeSaved');
    formPage.cancel();
    // Partner name in list should be unchanged
    listPage.shouldContainPartner('DemoName1');
  });
});
