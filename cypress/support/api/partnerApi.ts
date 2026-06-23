export interface ApiPartnerPayload {
  name: string;
  type: string;
  subscriptionTier: string;
  address: string;
  location: string;
  phone: string;
  contactPerson: string;
  description: string;
  serviceTypes: number[];
  hidden?: boolean;
  logo?: string;
}

export interface ApiPartner extends ApiPartnerPayload {
  uuid: string;
}

const apiUrl = (): string => Cypress.env('API_URL') as string;

export const loginApi = (email: string, password: string): Cypress.Chainable<string> =>
  cy.request({
    method: 'POST',
    url: `${apiUrl()}/admin/login`,
    body: { login: email, password },
  }).then((response) => response.body.accessToken as string);

export const createPartnerApi = (
  token: string,
  payload: ApiPartnerPayload,
): Cypress.Chainable<ApiPartner> =>
  cy.request({
    method: 'POST',
    url: `${apiUrl()}/admin/partner`,
    headers: { Authorization: token },
    body: payload,
  }).then((response) => response.body as ApiPartner);

export const updatePartnerApi = (
  token: string,
  uuid: string,
  payload: ApiPartnerPayload,
): Cypress.Chainable<ApiPartner> =>
  cy.request({
    method: 'PUT',
    url: `${apiUrl()}/admin/partner/${uuid}`,
    headers: { Authorization: token },
    body: { ...payload, uuid },
  }).then((response) => response.body as ApiPartner);

export const getPartnerApi = (token: string, uuid: string): Cypress.Chainable<ApiPartner> =>
  cy.request({
    method: 'GET',
    url: `${apiUrl()}/admin/partner/${uuid}`,
    headers: { Authorization: token },
  }).then((response) => response.body as ApiPartner);

/**
 * Reads the bearer token cy.session already stored via the UI login, so API
 * seeding can reuse the same authenticated session instead of logging in twice.
 */
export const getStoredAuthToken = (): Cypress.Chainable<string> =>
  cy.window().then((win) => {
    const raw = win.localStorage.getItem('auth');
    const parsed = raw ? JSON.parse(raw) : {};
    return parsed.accessToken as string;
  });
