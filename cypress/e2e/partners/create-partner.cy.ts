import { PartnersListPage, PartnerFormPage, PartnerDetailPage } from '../../support/pages';
import type { PartnerFormData } from '../../support/pages';
import { getPartnerApi, getStoredAuthToken } from '../../support/api/partnerApi';

describe('Create Partner', () => {
  const listPage = new PartnersListPage();
  const formPage = new PartnerFormPage();
  const detailPage = new PartnerDetailPage();
  let partner: PartnerFormData;

  before(() => {
    cy.fixture('partner').then((f) => { partner = f.newPartner; });
  });

  beforeEach(() => {
    cy.login();
    listPage.navigateViaMenu();
  });

  it('creates a new partner and validates it was persisted', () => {
    const partnerName = `${partner.name}-${Date.now()}`;
    cy.intercept('POST', '**/admin/partner').as('createPartner');

    cy.contains('button', 'New partner').click();

    formPage.fill({ ...partner, name: partnerName });
    formPage.uploadLogo('cypress/fixtures/images/partner-logo.png');
    formPage.save();

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

    // Also validate the dedicated detail page (reached by clicking a row's
    // address/phone/contact cell — clicking the name itself does nothing).
    listPage.openPartnerDetails(partnerName);
    detailPage
      .shouldDisplayName(partnerName)
      .shouldDisplayType(partner.type!)
      .shouldDisplayPhone(partner.phone!)
      .shouldDisplayContactName(partner.contactName!)
      .shouldDisplayAddress(partner.address!)
      .shouldDisplayDescription(partner.description!);
    partner.services?.forEach((service) => detailPage.shouldDisplayService(service));

    cy.get('#partner-details-card').should('be.visible');
    cy.screenshot(`partner-detail-page-${partnerName}`);
  });
});
