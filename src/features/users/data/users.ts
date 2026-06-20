import { faker } from '@faker-js/faker'

faker.seed(67890)

export const users = Array.from({ length: 100 }, () => {
  const firstName = faker.person.firstName()
  const lastName = faker.person.lastName()
  return {
    id: faker.string.uuid(),
    firstName,
    lastName,
    username: faker.internet
      .username({ firstName, lastName })
      .toLocaleLowerCase(),
    email: faker.internet.email({ firstName }).toLocaleLowerCase(),
    phoneNumber: faker.phone.number({ style: 'international' }),
    status: faker.helpers.arrayElement(['active', 'inactive', 'suspended']),
    role: faker.helpers.arrayElement(['admin', 'seller', 'client']),
    createdAt: faker.date.past(),
    updatedAt: faker.date.recent(),
  }
})
