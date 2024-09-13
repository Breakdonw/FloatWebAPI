import express, {type Request, type Response } from 'express';
import  Users  from './src/routes/Users';
import Transactions from './src/routes/Transactions'


BigInt.prototype.toJSON = function() {
  return this.toString()
} 

const app = express();
const port = process.env.PORT || 5174; // 5173 is our UI
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