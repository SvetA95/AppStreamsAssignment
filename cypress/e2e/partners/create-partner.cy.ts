/**
 * Create Partner workflow.
 *
 * NOTE: We don't yet have a Playwright recording of the Create flow, so the
 * form interactions here mirror the Edit recording (same form component).
 * Update selectors here if the Create form differs once you record it.
 */
import { PartnersListPage, PartnerFormPage, PartnerDetailPage } from '../../support/pages';
import type { PartnerFormData } from '../../support/pages';

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

  it('navigates to the Partners section', () => {
    cy.url().should('include', 'partner');
  });

  it('creates a new partner and validates the detail card', () => {
    // TODO: record the Create flow with Playwright codegen and confirm
    // the "New / Add" button selector, then replace the cy.visit below.
    // For now we navigate directly if a /partners/new route exists.
    cy.contains('button', /new|add|create/i).first().click();

    formPage.fill(partner);
    formPage.save();

    detailPage.shouldDisplayName(partner.name!);
    detailPage.shouldDisplayContactName(partner.contactName!);
    detailPage.shouldDisplayAddress(partner.address!);
    detailPage.shouldDisplayDescription(partner.description!);
  });
});
