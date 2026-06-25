import { PartnersListPage, PartnerFormPage, PartnerDetailPage } from '../../support/pages';
import type { PartnerFormData } from '../../support/pages';
import { createPartnerApi, getPartnerApi, getStoredAuthToken, type ApiPartnerPayload } from '../../support/api/partnerApi';

interface ApiSeedFixture extends Omit<ApiPartnerPayload, 'name'> {
  namePrefix: string;
}

describe('Update Partner', () => {
  const listPage = new PartnersListPage();
  const formPage = new PartnerFormPage();
  const detailPage = new PartnerDetailPage();
  let updated: PartnerFormData;
  let apiSeed: ApiSeedFixture;
  let seedPartnerName: string;
  let seedPartnerUuid: string;

  before(() => {
    cy.fixture('partner').then((f) => {
      updated = f.updatedPartner;
      apiSeed = f.apiSeed;
    });
  });

  // Seed a fresh, uniquely-named partner via API before every test so the
  // update flow never depends on pre-existing/shared data in the dev environment. 
  // This ensures the test is self-contained and repeatable.
  beforeEach(() => {
    cy.login();

    seedPartnerName = `${apiSeed.namePrefix}-${Date.now()}`;
    getStoredAuthToken()
      .then((token) => createPartnerApi(token, { ...apiSeed, name: seedPartnerName }))
      .then((created) => { seedPartnerUuid = created.uuid; });

    listPage.navigateViaMenu();
  });

  it('updates partner fields and validates changes are persisted', () => {
    const updatedName = `${updated.name}-${Date.now()}`;
    cy.intercept('PUT', '**/admin/partner/*').as('updatePartner');

    listPage.clickEditForPartner(seedPartnerName);
    cy.contains('Edit partner').should('be.visible');

    formPage
      .fillName(updatedName)
      .selectType('Insurer')
      .fillAddress(updated.address ?? 'Sofia, Bulgaria')
      .fillPhone(updated.phone!)
      .fillContactName(updated.contactName!)
      .fillDescription(updated.description!)
      .uploadLogo('cypress/fixtures/images/partner-logo.png');

    formPage.save();

    cy.wait('@updatePartner').then(({ response }) => {
      expect(response?.statusCode).to.eq(200);

      return getStoredAuthToken().then((token) => getPartnerApi(token, seedPartnerUuid)).then((persisted) => {
        expect(persisted.name).to.eq(updatedName);
        expect(persisted.type).to.eq('insurer');
        // The phone field auto-prepends a country code, so we only assert
        // the digits we typed are present rather than an exact match.
        expect(persisted.phone).to.include(updated.phone);
        expect(persisted.contactPerson).to.eq(updated.contactName);
        expect(persisted.description).to.eq(updated.description);
      });
    });

    listPage.shouldShowPartnerRow(updatedName, {
      phone: updated.phone,
      contactName: updated.contactName,
    });
  });

  it('opens the edit form from the partner details page', () => {
    listPage.openPartnerDetails(seedPartnerName);
    detailPage.openEditForm();
    cy.contains('Edit partner').should('be.visible');
    cy.get('#name-field').should('have.value', seedPartnerName);
    
    formPage.cancel();
  });

  it('cancel discards changes and returns to the list', () => {
    listPage.clickEditForPartner(seedPartnerName);
    formPage.fillName('ShouldNotBeSaved');
    formPage.cancel();
    // Partner name in list should be unchanged
    listPage.shouldContainPartner(seedPartnerName);
  });
});
