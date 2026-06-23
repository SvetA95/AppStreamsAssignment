import { loginApi, createPartnerApi, updatePartnerApi, getPartnerApi, type ApiPartnerPayload } from '../../support/api/partnerApi';

interface ApiSeedFixture extends Omit<ApiPartnerPayload, 'name'> {
  namePrefix: string;
}

describe('Partner API', () => {
  let token: string;
  let seed: ApiSeedFixture;

  before(() => {
    cy.fixture('partner').then((f) => { seed = f.apiSeed; });
  });

  beforeEach(() => {
    loginApi(Cypress.env('EMAIL'), Cypress.env('PASSWORD')).then((t) => { token = t; });
  });

  it('creates a partner and persists the submitted fields', () => {
    const name = `${seed.namePrefix}-api-${Date.now()}`;

    createPartnerApi(token, { ...seed, name }).then((created) => {
      expect(created.uuid).to.be.a('string');

      getPartnerApi(token, created.uuid).then((fetched) => {
        expect(fetched.name).to.eq(name);
        expect(fetched.address).to.eq(seed.address);
        expect(fetched.phone).to.eq(seed.phone);
        expect(fetched.contactPerson).to.eq(seed.contactPerson);
      });
    });
  });

  it('updates a partner and persists the changes', () => {
    const name = `${seed.namePrefix}-api-${Date.now()}`;
    const updatedDescription = 'Updated via API test';

    createPartnerApi(token, { ...seed, name }).then((created) => {
      updatePartnerApi(token, created.uuid, { ...seed, name, description: updatedDescription }).then(() => {
        getPartnerApi(token, created.uuid).then((fetched) => {
          expect(fetched.description).to.eq(updatedDescription);
        });
      });
    });
  });

  it('rejects login with invalid credentials', () => {
    cy.request({
      method: 'POST',
      url: `${Cypress.env('API_URL')}/admin/login`,
      body: { login: 'wrong@example.com', password: 'wrongpassword' },
      failOnStatusCode: false,
    }).then((response) => {
      expect(response.status).to.be.oneOf([400, 401, 403]);
    });
  });
});
