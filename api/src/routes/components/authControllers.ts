import { PrismaClient, Prisma, type Users } from "@prisma/client";
import dotenv from "dotenv";

dotenv.config({ path:"../../../" });
const JWTSECRET = process.env.JWTSECRET;
var jwt = require("jsonwebtoken");
const prisma = new PrismaClient();
const bcrypt = require("bcryptjs");

/**
 * The function `changePassword` updates the password of a user identified by their `userid` with the
 * provided `password` after encrypting it.
 *
 * Args:
 *   userid (number): The `userid` parameter is the unique identifier of the user whose password needs
 * to be changed. It is of type `number`.
 *   password (string): The `password` parameter is a string that represents the new password that the
 * user wants to set.
 */
export async function changePassword(userid: number, password: string) {
  let encryptedPassword = encryptPassword(password);
  let user = await prisma.users.update({
    where: {
      id: BigInt(userid),
    },
    data: {
      password: encryptedPassword,
    },
  });
}

/**
 * The function `decodeToken` decodes a JWT token and returns the decoded token if it is valid,
 * otherwise it returns an error message.
 *
 * Args:
 *   token (any): The `token` parameter is the JWT token that you want to decode.
 *
 * Returns:
 *   the decoded token.
 */
export async function decodeToken(token: any) {
  try {
    let decodedToken = await jwt.verify(token, JWTSECRET);
    if(token === null || decodedToken == null){throw new Error("Invalid token")}
    return decodedToken;
  } catch (error) {

    console.log(error);
    return {error:true ,errormsg:error };
  }
}

/**
 * The function verifies a token and returns the decoded token if it is valid, otherwise it returns an
 * error message.
 *
 * Args:
 *   token (any): The `token` parameter is the token that needs to be verified. It is usually passed as
 * a header or as a query parameter in an HTTP request.
 *   res (Response): The `res` parameter is the response object that is used to send the response back
 * to the client. It is typically an instance of the `Response` class from a web framework like
 * Express.js.
 *
 * Returns:
 *   the decoded token if it is successfully verified.
 */
export async function verifyToken(token: any, res: any) {
  if (!token) {
    return res.status(403).send({
      message: "No token provided!",
    });
  }
  let decoded = await decodeToken(token)
  console.log(decoded)

  if (  decoded.error == true  ) {
    console.log(decoded)
    console.log(decoded.error)
  res.status(500).send({errormsg:decoded.errormsg, error:true})
  return false;

} else { 
    return true;
  }

  return false;
}

/**
 * The function encrypts a password using bcrypt with a cost factor of 10.
 *
 * Args:
 *   pwd (string): The `pwd` parameter is a string that represents the password that needs to be
 * encrypted.
 *
 * Returns:
 *   The encrypted password.
 */
export async function encryptPassword(pwd: string) {
  const salt = await bcrypt.genSalt(10);
  const hash = await bcrypt.hash(pwd, salt);
  return hash;
}




/**
 * The function `getJWToken` generates a JSON Web Token (JWT) for a given user ID.
 *
 * Args:
 *   userid (number): The `userid` parameter is the unique identifier of the user for whom you want to
 * generate a JSON Web Token (JWT).
 *
 * Returns:
 *   The function `getJWToken` returns a Promise that resolves to a string.
 */
export async function getJWToken(user: Users) {
  return new Promise<string>((resolve, reject) => {
    jwt.sign(
      {
        id: user.id,
        firstName: user.first,
        lastName: user.last,
        email: user.email,
      },
      JWTSECRET,
      {
        algorithm: "HS256",
        allowInsecureKeySizes: true,
        expiresIn: 86400 * 2, // 24h
      },
      (err, token) => {
        if (err) {
          reject(err);
        } else {
          resolve(token);
        }
      }
    );
  });
}

/**
 * The function `getUserInfo` retrieves user information from a database using the provided user ID.
 *
 * Args:
 *   userid (number): The `userid` parameter is a number that represents the ID of the user whose
 * information you want to retrieve.
 *
 * Returns:
 *   a Promise that resolves to the user object if it exists, or null if it does not exist.
 */
export async function getUserInfo(userid: number) {
  let user = await prisma.users.findFirst({
    where: {
      id: userid,
    },
  });

  if (!user) {
    return null;
  }

  return await user;
}

/**
 * The function compares two passwords using bcrypt and returns a boolean indicating if they match.
 *
 * Args:
 *   passwordOne (string): The first password to compare.
 *   passwordTwo (string): The `passwordTwo` parameter is the password that you want to compare with
 * `passwordOne`.
 *
 * Returns:
 *   the result of the comparison between the two passwords using bcrypt.compareSync.
 */
export async function comparePasswords(plain: string, dbEncyrpted: string) {
  let truth = await bcrypt.compareSync(plain, dbEncyrpted);
  return truth;
}

/**
 * The function `LoginUser` is an asynchronous function that takes in an email address, password, and a
 * response object, and attempts to log in the user by checking if the email and password match an
 * existing user in the database, updating the user's last login date, and returning a JSON Web Token
 * (JWT) if successful.
 *
 * Args:
 *   emailAddress (string): The `emailAddress` parameter is a string that represents the email address
 * of the user trying to log in.
 *   password (string): The `password` parameter is a string that represents the user's password.
 *   res (Response): The `res` parameter is an instance of the `Response` object from an HTTP server
 * framework. It is used to send the response back to the client after the login process is complete.
 *
 * Returns:
 *   a token if the login is successful. If the login fails, it returns null.
 */
export async function LoginUser(
  emailAddress: string,
  password: string,
  res: Response
) {
  try {
    const user = await prisma.users.findFirst({
      where: {
        email: emailAddress
      },
    });
    if (!user || !(await comparePasswords(password, user.password))) {
      // User with the same email already exists, return an error response
      res.status(500).send({ error: "Invalid email or password" });
      return null; // Return null to indicate login failure
    }

    await prisma.users.update({
      where: {
        id: user.id,
      },
      data: {
        lastLogin: new Date(),
      },
    });

    const token = await getJWToken(user);

    return {
      token: token,
      fName: user.first,
      lName: user.last,
    };
  } catch (error) {
    // Handle any errors that may occur during login

    throw error; // You can choose to handle or propagate the error as needed
  } finally {
    await prisma.$disconnect(); // Disconnect from the Prisma client to release resources
  }
}

/**
 * The function `RegisterUser` is used to register a new user by checking if the email is already
 * registered, encrypting the password, creating a new user in the database, and generating a JWT
 * token.
 *
 * Args:
 *   fName (string): The `fName` parameter represents the first name of the user being registered.
 *   lName (string): The parameter "lName" stands for the last name of the user.
 *   emailAddress (string): The `emailAddress` parameter is a string that represents the email address
 * of the user who is registering.
 *   password (string): The password parameter is a string that represents the user's password.
 *   res (resp): The "res" parameter is the response object that is used to send the HTTP response back
 * to the client. It is typically used to set the status code and send the response body. In this code
 * snippet, it is used to send an error response if a user with the same email already exists.
 *
 * Returns:
 *   a JWT token.
 */
export async function RegisterUser(
  fName: string,
  lName: string,
  emailAddress: string,
  password: string,
  res: Response
) {
  const userExists = await prisma.users.findFirst({
    where: {
      OR: [{ email: emailAddress }],
    },
  });

  if (userExists) {
    // User with the same email already exists, return an error response
    res.status(500).send({
      error:
        "An account with this email exists please try another email or reset your password to your current account.",
    });
    throw new Error("Email is already registered");
  }

  const encryptedPassword = await encryptPassword(password);
  let createUser
  try {
   createUser = await prisma.users.create({
      data: {
        first: fName,
        last: lName,
        email: emailAddress,
        password: encryptedPassword,
        lastLogin: new Date(),
      },
    });
  } catch (error) {
    console.error(error);
  }

  try {
    const token = await getJWToken(createUser);
    return token;
  } catch (error) {
    // Handle the error when JWT token generation fails
    console.error("JWT token generation failed:", error);
    throw error; // You can choose to handle or propagate the error as needed
  }
}

export default async function getUsers() {
  try {
    let data = await prisma.users.findMany({
      where: {
      },
      select: {
        first: true,
        last: true,
        id: true,
        lastLogin: true,
      },
    });
    prisma.$disconnect();
    return data;
  } catch (error) {
    console.log(error);
  }
  return false;
}

export async function updateUser(
  userId: number,
  first?: string,
  last?: string
) {
  if (userId === null) {
    console.error("No user Id provided auth updateUser...");
    return false;
  }

  try {
    let response = await prisma.users.update({
      where: {
        id: userId,
      },
      data: {
        first: first ? first : undefined,
        last: last ? last : undefined,
      },
    });
    return true;
  } catch (e) {
    console.warn(e);
    return e;
  }
}
