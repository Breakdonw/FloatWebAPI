import { PrismaClient } from '@prisma/client';
import { faker } from '@faker-js/faker';
import { endOfMonth } from 'date-fns';  // Import date-fns to get the end of the current month

const prisma = new PrismaClient();

async function seed() {
  try {
    // Get all current users
    const existingUsers = await prisma.users.findMany();
    console.log(`Found ${existingUsers.length} existing users.`);

    // Generate fake accounts and transactions for existing users
    for (const user of existingUsers) {
      await createUserAccountsAndTransactions(user.id);
    }

    // Create new fake users and accounts
    for (let i = 0; i < 10; i++) {
      const newUser = await prisma.users.create({
        data: {
          first: faker.name.firstName(),
          last: faker.name.lastName(),
          email: faker.internet.email(),
          password: faker.internet.password(),
          lastLogin: faker.date.recent(),
          updatedBy: faker.number.int({ min: 1, max: 100 }),
        },
      });
      await createUserAccountsAndTransactions(newUser.id);
    }

    console.log('Data seeding completed.');
  } catch (error) {
    console.error('Error seeding data:', error);
  } finally {
    await prisma.$disconnect();
  }
}

async function createUserAccountsAndTransactions(userId: bigint) {
  const endOfCurrentMonth = endOfMonth(new Date()); // Get the end of the current month

  for (let i = 0; i < 3; i++) {
    const newAccount = await prisma.userAccount.create({
      data: {
        accountNumber: BigInt(faker.finance.accountNumber()),
        provider: faker.company.name(),
        nickName: faker.finance.accountName(),
        balance: Number(faker.finance.amount({ min: 1000, max: 100000 })),
        type: faker.helpers.arrayElement(['checkings', 'savings', 'credit']), // Use the accountType enum
        userid: userId,
      },
    });

    // Create transactions for this account
    for (let j = 0; j < 200; j++) {
      await prisma.transactions.create({
        data: {
          amount: Number(faker.finance.amount({ min: 100, max: 5000 })),
          accountid: newAccount.id,
          company: faker.company.name(),
          categoryid: await getRandomCategoryId(), // Get an existing category id
          type: faker.helpers.arrayElement(['purchase', 'creditCardPayment', 'savingsDeposit', 'recurring', 'income']), // Add type based on your enum
          Frequency: faker.datatype.boolean() ? faker.number.int({ min: 1, max: 12 }) : null, // Optionally set frequency
          date: faker.date.between({from:'2024-01-01', to:endOfCurrentMonth}), // Generate dates up to the end of the current month
        },
      });
    }
  }
}

async function getRandomCategoryId(): Promise<bigint> {
  // Fetch the existing categories in the DB
  let categories = await prisma.transactionsCategory.findMany();
  


  // Pick a random category
  const randomIndex = faker.number.int({ min: 0, max: categories.length - 1 });
  return categories[randomIndex].id;
}

seed();
