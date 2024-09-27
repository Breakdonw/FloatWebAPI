import express, {type Request, type Response } from 'express';
import  Users  from './src/routes/Users';
import Transactions from './src/routes/Transactions'
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();


BigInt.prototype.toJSON = function() {
  return this.toString()
} 


async function initializeDefaultCategories() {
  const existingCategories = await prisma.transactionsCategory.findMany();
  
  if (existingCategories.length === 0) {
    await prisma.transactionsCategory.createMany({
      data: [
        { name: 'Bills', icon: '🧾', color: '#ff0000', description: 'Bill payments and utilities' },
        { name: 'Loans', icon: '💸', color: '#00ff00', description: 'Loan repayments and related' },
        { name: 'Entertainment', icon: '🎉', color: '#0000ff', description: 'Movies, games, etc.' },
        { name: 'Groceries', icon: '🛒', color: '#ffff00', description: 'Grocery shopping' },
        { name: 'Shopping', icon: '🛍️', color: '#ff00ff', description: 'Retail shopping' },
        { name: 'Subscriptions', icon: '📅', color: '#00ffff', description: 'Recurring subscriptions' },
        { name: 'Uncategorized', icon: '❓', color: '#808080', description: 'Uncategorized transactions' }
      ]
    });
    console.log('Default categories added to the database.');
  } else {
    console.log('Categories already exist in the database.');
  }
}

initializeDefaultCategories().catch((e) => {
  console.error(e);
  process.exit(1);
}).finally(async () => {
  await prisma.$disconnect();
});


export const app = express();
const port = process.env.PORT || 3000; // 5173 is our UI
const bodyparser = require('body-parser')
const cors = require('cors');

app.use(express.json())
app.use(express.urlencoded({extended:true}))
app.use(cors({ origin: true }));

app.get('/',(req: Request, res: Response) =>{
  res.send('You ventured to far.')
})

app.use('/User', Users)
app.use('/Transaction', Transactions)

app.listen(port, ()=>{
  console.log(`Server running @ port:${port}`)
})