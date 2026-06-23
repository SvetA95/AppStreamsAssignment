import { PartnersListPage, PartnerFormPage } from '../../support/pages';
import type { PartnerFormData } from '../../support/pages';
import { getPartnerApi, getStoredAuthToken } from '../../support/api/partnerApi';

describe('Create Partner', () => {
  const listPage = new PartnersListPage();
  const formPage = new PartnerFormPage();
  let partner: PartnerFormData;

  before(() => {
    cy.fixture('partner').then((f) => { partner = f.newPartner; });
  });

  beforeEach(() => {
    cy.login();
    listPage.navigateViaMenu();
  });

  it('navigates to the Partners section', () => {
    cy.url().should('include', 'partner');
  });

  it('creates a new partner and validates it was persisted', { tags: '@smoke' }, () => {
    const partnerName = `${partner.name}-${Date.now()}`;
    cy.intercept('POST', '**/admin/partner').as('createPartner');

    cy.contains('button', 'New partner').click();

    formPage.fill({ ...partner, name: partnerName });
    formPage.uploadLogo('cypress/fixtures/images/partner-logo.png');
    formPage.save();

    // The app has no standalone detail page, so persistence is validated
    // two ways: the list row (what the UI itself shows the user) and a
    // direct API fetch (covers fields like type/description that aren't
    // rendered as list columns at all).
    cy.wait('@createPartner').then(({ response }) => {
      expect(response?.statusCode).to.eq(200);
      const uuid = response?.body.uuid as string;

      return getStoredAuthToken().then((token) => getPartnerApi(token, uuid)).then((persisted) => {
        expect(persisted.name).to.eq(partnerName);
        expect(persisted.type).to.eq('carService');
        expect(persisted.address).to.eq(partner.address);
        // The phone field auto-prepends a country code, so we only assert
        // the digits we typed are present rather than an exact match.
        expect(persisted.phone).to.include(partner.phone);
        expect(persisted.contactPerson).to.eq(partner.contactName);
        expect(persisted.description).to.eq(partner.description);
      });
    });

    listPage.shouldShowPartnerRow(partnerName, {
      address: partner.address,
      phone: partner.phone,
      contactName: partner.contactName,
      services: partner.services,
    });
  });
});
