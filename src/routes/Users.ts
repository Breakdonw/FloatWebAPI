import { Router,type Request,type Response } from "express";
import * as Auth from "./components/authControllers";


async function securityCheck(accessToken: any, res: Response, level?: number) {
  
  if (accessToken === undefined) {
    res.status(500).send({ error: "No Token Provided" });
    return false;
  }

  let token = await Auth.decodeToken(accessToken);
  
  let permissionLevel = level ? level : 1;
  
  if (!token || token === false) {
    res.status(500).send({
      error: "There was an error with your request. Please attempt to relogin.",
    });
    return false;
  }

  return token;
}

const router = Router();

router.post("/GetUsers", async (req: Request, res: Response) => {
  if ((await securityCheck(req.body.accessToken, res, 3)) === false) {
    return;
  }
  try {
    let data = await Auth.default();
    res.status(200).send(data);
  } catch (error) {
    res.status(500).send({
      error: "There was an error with your request. Please attempt to relogin.",
    });
  }

  return;
});

router.post("/UpdateUser", async (req: Request, res: Response) => {
  let token = await securityCheck(req.body.accessToken, res, 7);
  let { body } = req;
  try {
   let result = await Auth.updateUser(
      Number(body.userid),
      body.firstName,
      body.lastName,
    );
    result === true ?res.sendStatus(200) : res.sendStatus(500)
  } catch (e) {
    
    console.warn(e);
  }
});




router.post("/Login", async (req: Request, res: Response) => {
  if (!req.body.email || !req.body.password) {
    res.status(500).send({
      error: "A required Field was missing when the login message was sent",
    });
    return 0;
  }
  try {
    const data = await Auth.LoginUser(req.body.email, req.body.password, res);
    console.log(await data?.token);
    res.status(200).send({
      message: "User logged in successfully",
      accessToken: data?.token,
      firstName: data?.fName,
      lastName: data?.lName,
      role: data?.role,
    });
  } catch (e) {
    res.status(500).send({
      error: " An error occured while processing this message ",
      exception: `${e}`,
    });
    return 0;
  }
});

router.post("/Register", async (req: Request, res: Response) => {
  if (
    !req.body.firstName ||
    !req.body.lastName ||
    !req.body.email ||
    !req.body.password 
  ) {
    res.status(500).send({
      error: "A required Field was missing when the message was sent",
    });

    return 0;
  }

  try {
    const token = await Auth.RegisterUser(
      req.body.firstName,
      req.body.lastName,
      req.body.email,
      req.body.password,
      res
    );
    res
      .status(200)
      .send({ message: "User Created succesfully!", accessToken: token });
  } catch (e) {
    res.status(500).send({
      error: " An error occured while processing this message ",
      exception: `${e}`,
    });
    return 0;
  }
});

router.post("/VerifyToken", async (req: Request, res: Response) => {
  if (!req.body.accessToken) {
    res.status(500).send({
      error:
        "A Token was not submitted was not submited thus could not be verified",
    });
    return 0;
  }
  if ((await Auth.verifyToken(req.body.accessToken, res)) === true) {
    res.status(200).send({ message: "authorized" });
  } else {
    res.status(201).send({ error: "Token Expired" });
  }
});

export default router;
