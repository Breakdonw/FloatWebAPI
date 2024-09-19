import e, { response, Router, type Request, type Response } from "express";
import * as Auth from "./components/authControllers";
import { PrismaClient, transactionsTypes, accountType, type UserAccount, type Transactions } from "@prisma/client";
import { error } from "console";
const router = Router();
const prisma = new PrismaClient();

// Disablled for safety only uncomment for testing.
// router.get('/all',async (req:Request, res:Response)=>{
//     const data = prisma.transactions.findMany({select:{
//         id:true,
//         account:{
//             select:{
//                 id:true,
//                 accountNumber:true,

//             }
//         },
//         category:{
//             select:{
//                 name:true,
//             }
//         },
//         amount:true,
//         company:true,
//         date:true,

//     }})

//     if(!Auth.verifyToken(req.body.accessToken)){
//         res.status(401).send({error: "Unauthorized."})
//         return
//     }

//     res.status(200).send({data:await data, })

// })


router.post("/getCategories", async (req: Request, res: Response) => {
  if (!Auth.verifyToken(req.body.data.accessToken, res) || Auth.verifyToken(req.body.data.accessToken, res) === undefined) {

    res.status(401).send({ error: "Unauthorized." });
    return;
  }
  const data = await prisma.transactionsCategory.findMany({
    select:{
      id: true,
      name: true,
      icon: true,
      color: true,
    }
    
  });

  res.status(200).send({ data: data });
  prisma.$disconnect();
  return true;
});

router.post('/createTransaction', async (req:Request, res:Response)=>{
  if (!Auth.verifyToken(req.body.data.accessToken, res) || Auth.verifyToken(req.body.data.accessToken, res) === undefined) {

    res.status(401).send({ error: "Unauthorized." });
    return;
  }

  const token = await Auth.decodeToken(req.body.data.accessToken);
  if(token.error == true){
    res.status(500).send({errorMsg:token.error, error:true})
  }

  const transaction = req.body.data.transaction as Transactions
  const data = await prisma.transactions.create({
    data:{
      amount:transaction.amount,
      accountid:transaction.accountid,
      company:transaction.company,
      categoryid:transaction.categoryid,
      type:transaction.type,
      Frequency:transaction.Frequency,
      date:transaction.date      
    }
  });

  res.status(200).send({ data: data });
  prisma.$disconnect();
  return true;
})

router.post("/UserTransaction", async (req: Request, res: Response) => {
  if (!Auth.verifyToken(req.body.data.accessToken, res) || Auth.verifyToken(req.body.data.accessToken, res) === undefined) {

    res.status(401).send({ error: "Unauthorized." });
    return;
  }
  const token = await Auth.decodeToken(req.body.data.accessToken);
  if(token.error == true){
    res.status(500).send({errorMsg:token.error, error:true})
  }

  const userid = token.id;

  const data = await prisma.users.findFirst({
    where: {
      id: userid,
    },
    select: {
      accounts: {
        select: {
          id:true,
          nickName:true,
          accountNumber:true,
      
          transactions: {
            select: {
              id: true,
              amount: true,
              company: true,
              type:true,
              Frequency:true,
              category: {
                select: {
                  id:true,
                  name: true,
                  icon: true,
                  color: true,
                },
              },
              date: true,
            },
          },
        },
      },
    },
  });

  res.status(200).send({ data: data });
  prisma.$disconnect();
  return true;
});


router.post('/updateTransaction', async (req:Request, res:Response)=>{
  if (!Auth.verifyToken(req.body.data.accessToken, res) || Auth.verifyToken(req.body.data.accessToken, res) === undefined) {

    res.status(401).send({ error: "Unauthorized." });
    return;
  }


  const token = await Auth.decodeToken(req.body.data.accessToken);
  if(token.error == true){
    res.status(500).send({errorMsg:token.error, error:true})
  }

  const userid = token.id;
  const transaction = req.body.data.transaction as Transactions;

  const data = await prisma.transactions.update({
    where:{
      account:{
        userid:userid
      },
      id:transaction.id
    },
    data:{
      amount:transaction.amount,
      accountid:transaction.accountid,
      company:transaction.company,
      categoryid:transaction.categoryid,
      type:transaction.type,
      Frequency:transaction.Frequency,
      date:new Date(transaction.date) 
    }
  });

  res.status(200).send({ data: data });
  prisma.$disconnect();
  return true;
})

router.post('/removeTransaction', async (req:Request, res:Response)=>{
  if (!Auth.verifyToken(req.body.data.accessToken, res) || Auth.verifyToken(req.body.data.accessToken, res) === undefined) {

    res.status(401).send({ error: "Unauthorized." });
    return;
  }
  if(!req.body.data.transactionId){
    res.status(400).send({error: "Missing Transaction ID.."})
    return;
  }

  const token = await Auth.decodeToken(req.body.data.accessToken);
  if(token.error == true){
    res.status(500).send({errorMsg:token.error, error:true})
  }

  const userid = token.id;
  const accountId = req.body.data.transactionId;


  const data = await prisma.transactions.delete({
    where:{
      id:accountId,
      account:{
        userid:userid
      }
    }
  });

  res.status(200).send({ data: data });
  prisma.$disconnect();
  return true;
});


router.get("/UserReoccuring", async (req: Request, res: Response) => {
  if (!Auth.verifyToken(req.query.accessToken, res) == undefined) {
    res.status(401).send({ error: "Unauthorized." });
    return;
  }

  const token = await Auth.decodeToken(req.query.accessToken);
  const userid = token.id;

  const data = await prisma.users.findFirst({
    where: {
      id: userid,

    },
    select: {
      accounts: {
        
        select: {
          id:true,
          nickName:true,
          transactions: {
            where:{
                type:transactionsTypes.reoccuring
            },
            select: {
              id: true,
              amount: true,
              company: true,
              category: {
                select: {
                  name: true,
                  icon: true,
                  color: true,
                },
              },
              date: true,
            },
          },
        },
      },
    },
  });

  res.status(200).send({ data: data });
  prisma.$disconnect();
  return true;
});

router.post("/UserSavingsData", async (req: Request, res: Response) => {
  if (!Auth.verifyToken(req.body.data.accessToken, res) || Auth.verifyToken(req.body.data.accessToken, res) === undefined) {

    res.status(401).send({ error: "Unauthorized." });
    return;
  }
  const token = await Auth.decodeToken(req.body.data.accessToken);
  if(token.error == true){
    res.status(500).send({errorMsg:token.error, error:true})
  }

  const userid = token.id;

  const data = await prisma.users.findFirst({
    where: {
      id: userid,
    },
    select: {
      accounts: {
        where:{
          type: accountType.savings,
          
        },

        select: {
          id:true,
        accountNumber:true,
        provider:true,
        nickName:true,
        balance:true,
        intrest:true,
        maxBalance:true,
          transactions: {
            orderBy:{
              date:'desc'
            },
            select: {
              id: true,
              amount: true,
              company: true,
              type:true,
              category: {
                select: {
                  name: true,
                  icon: true,
                  color: true,
                },
              },
              date: true,
            },
          },
        },
      },
    },
  });

  res.status(200).send({ data: data });
  prisma.$disconnect();
  return true;
});


router.post("/UserCreditCard", async (req:Request, res:Response)=>{
  if (!Auth.verifyToken(req.body.data.accessToken, res) == undefined) {
    res.status(401).send({ error: "Unauthorized." });
    return;
  }

  const token = await Auth.decodeToken(req.body.data.accessToken);
  const userid = token.id;

  const data = await prisma.users.findFirst({
    where: {
      id: userid,

    },
    select: {
      accounts: {
        where:{
          type:accountType.credit
        },
        select: {
          id:true,
          nickName:true,
          provider: true,
          accountNumber: true,
          intrest: true,
          maxBalance:true,
          balance:true,
        },
      },
    },
  });

  res.status(200).send({ data: data });
  prisma.$disconnect();
  return true;
})


router.post('/createUserAccount', async (req:Request, res:Response)=>{
  if (!Auth.verifyToken(req.body.data.accessToken, res) || Auth.verifyToken(req.body.data.accessToken, res) === undefined) {

    res.status(401).send({ error: "Unauthorized." });
    return;
  }

  const token = await Auth.decodeToken(req.body.data.accessToken);
  if(token.error == true){
    res.status(500).send({errorMsg:token.error, error:true})
  }

  const userid = token.id;
  const account = req.body.data.account as UserAccount
  const data = await prisma.userAccount.create({
    data:{
      userid:userid,
      accountNumber:account.accountNumber,
      provider:account.provider,
      nickName:account.nickName,
      balance:0,
      intrest:account.intrest,
      maxBalance:account.maxBalance,
      type:account.type
    }
  });

  res.status(200).send({ data: data });
  prisma.$disconnect();
  return true;
})


router.post('/getUserAccounts', async (req:Request, res:Response)=>{
  if (!Auth.verifyToken(req.body.data.accessToken, res) || Auth.verifyToken(req.body.data.accessToken, res) === undefined) {

    res.status(401).send({ error: "Unauthorized." });
    return;
  }
  const token = await Auth.decodeToken(req.body.data.accessToken);
  if(token.error == true){
    res.status(500).send({errorMsg:token.error, error:true})
  }

  const userid = token.id;

  const data = await prisma.users.findFirst({
    where: {
      id: userid,
    },
    select: {
      accounts: {
        select: {
          id:true,
          accountNumber:true,
          provider:true,
          nickName:true,
          balance:true,
          intrest:true,
          maxBalance:true,
          type:true,
        },
      },
    },
  });

  res.status(200).send({ data: data });
  prisma.$disconnect();
  return true;
});

router.post('/updateUseraccount', async (req:Request, res:Response)=>{
  if (!Auth.verifyToken(req.body.data.accessToken, res) || Auth.verifyToken(req.body.data.accessToken, res) === undefined) {

    res.status(401).send({ error: "Unauthorized." });
    return;
  }
  if(!req.body.data.userAccountId){
    res.status(400).send({error: "Missing Account ID.."})
    return;
  }

  const token = await Auth.decodeToken(req.body.data.accessToken);
  if(token.error == true){
    res.status(500).send({errorMsg:token.error, error:true})
  }

  const userid = token.id;
  const account = req.body.data.account as UserAccount;

  const data = await prisma.userAccount.update({
    where:{
      userid:userid,
      id:account.id
    },
    data:{
      accountNumber:account.accountNumber,
      provider:account.provider,
      nickName:account.nickName,
      intrest:account.intrest,
      maxBalance:account.maxBalance,
      type:account.type
    }
  });

  res.status(200).send({ data: data });
  prisma.$disconnect();
  return true;
})

router.post('/removeUserAccount', async (req:Request, res:Response)=>{
  if (!Auth.verifyToken(req.body.data.accessToken, res) || Auth.verifyToken(req.body.data.accessToken, res) === undefined) {

    res.status(401).send({ error: "Unauthorized." });
    return;
  }
  if(!req.body.data.userAccountId){
    res.status(400).send({error: "Missing Account ID.."})
    return;
  }

  const token = await Auth.decodeToken(req.body.data.accessToken);
  if(token.error == true){
    res.status(500).send({errorMsg:token.error, error:true})
  }

  const userid = token.id;
  const accountId = req.body.data.userAccountId;


  const data = await prisma.userAccount.delete({
    where:{
      userid:userid,
      id:accountId
    }
  });

  res.status(200).send({ data: data });
  prisma.$disconnect();
  return true;
})

export default router;
