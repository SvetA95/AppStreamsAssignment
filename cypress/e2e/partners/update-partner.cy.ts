import { PartnersListPage, PartnerFormPage } from '../../support/pages';
import type { PartnerFormData } from '../../support/pages';
import { createPartnerApi, getPartnerApi, getStoredAuthToken, type ApiPartnerPayload } from '../../support/api/partnerApi';

interface ApiSeedFixture extends Omit<ApiPartnerPayload, 'name'> {
  namePrefix: string;
}

describe('Update Partner', () => {
  const listPage = new PartnersListPage();
  const formPage = new PartnerFormPage();
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
  // update flow never depends on pre-existing/shared data in the dev
  // environment (which has no delete endpoint to clean up after itself).
  beforeEach(() => {
    cy.login();

    seedPartnerName = `${apiSeed.namePrefix}-${Date.now()}`;
    getStoredAuthToken()
      .then((token) => createPartnerApi(token, { ...apiSeed, name: seedPartnerName }))
      .then((created) => { seedPartnerUuid = created.uuid; });

    listPage.navigateViaMenu();
  });

  it('opens the edit form via the row action menu', () => {
    listPage.clickEditForPartner(seedPartnerName);
    cy.contains('Edit partner').should('be.visible');
  });

  it('updates partner fields and validates changes are persisted', { tags: '@smoke' }, () => {
    const updatedName = `${updated.name}-${Date.now()}`;
    cy.intercept('PUT', '**/admin/partner/*').as('updatePartner');

    listPage.clickEditForPartner(seedPartnerName);

    formPage
      .fillName(updatedName)
      .selectType('Insurer')
      .fillAddress(updated.address ?? 'Sofia, Bulgaria')
      .fillPhone(updated.phone!)
      .fillContactName(updated.contactName!)
      .fillDescription(updated.description!)
      .uploadLogo('cypress/fixtures/images/partner-logo.png');

    formPage.save();

    // The app has no standalone detail page, so persistence is validated two
    // ways: the list row (what the UI itself shows the user) and a direct
    // API fetch (covers fields like type/description that aren't rendered
    // as list columns). The exact wire value for "Insurer" isn't known, so
    // we assert the GET reflects whatever the UI actually submitted.
    cy.wait('@updatePartner').then(({ request, response }) => {
      expect(response?.statusCode).to.eq(200);
      const submittedType = request.body.type as string;

      return getStoredAuthToken().then((token) => getPartnerApi(token, seedPartnerUuid)).then((persisted) => {
        expect(persisted.name).to.eq(updatedName);
        expect(persisted.type).to.eq(submittedType);
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

  it('cancel discards changes and returns to the list', () => {
    listPage.clickEditForPartner(seedPartnerName);
    formPage.fillName('ShouldNotBeSaved');
    formPage.cancel();
    // Partner name in list should be unchanged
    listPage.shouldContainPartner(seedPartnerName);
  });
});
