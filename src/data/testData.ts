import { faker } from '@faker-js/faker/locale/en_GB';

export interface Customer {
  firstName: string;
  lastName: string;
  email: string;
  telephone: string;
  password: string;
}

export interface Address {
  address1: string;
  city: string;
  postcode: string;
  country: string;
}

export const DEFAULT_PASSWORD = 'Test@12345';

const uniqueSuffix = (): string => faker.string.alphanumeric({ length: 8, casing: 'lower' });

/** Unique, realistic customer — scenarios never collide on the shared demo store. */
export function newCustomer(overrides: Partial<Customer> = {}): Customer {
  const firstName = faker.person.firstName();
  const lastName = faker.person.lastName();
  return {
    firstName,
    lastName,
    email: `qa.${firstName}.${uniqueSuffix()}@example.com`.toLowerCase().replace(/[^a-z0-9.@]/g, ''),
    telephone: `07${faker.string.numeric(9)}`,
    password: DEFAULT_PASSWORD,
    ...overrides,
  };
}

export function newAddress(): Address {
  return {
    address1: faker.location.streetAddress(),
    city: faker.location.city(),
    postcode: 'SW1A 1AA',
    country: 'United Kingdom',
  };
}

export function unregisteredEmail(): string {
  return `not.registered.${uniqueSuffix()}@example.com`;
}
