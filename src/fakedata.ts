import { PrismaClient } from '@prisma/client';
import {faker}  from "@faker-js/faker"

const prisma = new PrismaClient();

async function seed() {
  try {
    // Get all current users
    const existingUsers = await prisma.users.findMany();
    console.log(`Found ${existingUsers.length} existing users.`);

    // Generate fake accounts for existing users
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
  for (let i = 0; i < 3; i++) {
    const newAccount = await prisma.userAccount.create({
      data: {
        accountNumber: BigInt(faker.finance.accountNumber()),
        provider: faker.company.name(),
        nickName: faker.finance.accountName(),
        balance: Number(faker.finance.amount({min:1000, max:100000})),
        type: faker.number.int({ min: 1, max: 3 }), // Assuming types 1-3
        userid: userId,
      },
    });

    // Create transactions for this account
    for (let j = 0; j < 5; j++) {
      await prisma.transactions.create({
        data: {
          amount: Number(faker.finance.amount({min:100, max:5000})),
          accountid: newAccount.id,
          company: faker.company.name(),
          categoryid: await getRandomCategoryId(),
          date: faker.date.past(),
        },
      });
    }
  }
}

async function getRandomCategoryId(): Promise<bigint> {
  let categories = await prisma.transactionsCategory.findMany();
  if (categories.length == 0){
    for (let index = 0; index < 10; index++) {
     let data = prisma.transactionsCategory.create({
        data:{
          name:faker.finance.transactionType(),
          icon:faker.image.avatar(),
          color:faker.color.rgb(),
          description:faker.finance.transactionDescription(),
        }
      })
      console.log(await data)
    }
    categories = await prisma.transactionsCategory.findMany();
  }
  const randomIndex = faker.number.int({min:0, max:categories.length - 1 });
  console.log(randomIndex)
  // return categories[randomIndex].id;
    return categories[randomIndex].id
}

seed();
