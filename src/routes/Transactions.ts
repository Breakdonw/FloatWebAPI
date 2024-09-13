import { response, Router, type Request, type Response } from "express";
import * as Auth from "./components/authControllers";
import { PrismaClient, transactionsTypes } from "@prisma/client";
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

router.get("/UserTransaction", async (req: Request, res: Response) => {
  if (!Auth.verifyToken(req.query.accessToken, res)) {
    console.log(req.query)

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
          transactions: {
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

export default router;
