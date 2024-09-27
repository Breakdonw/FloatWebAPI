import { expect, jest, test, vi } from "bun:test";
import * as Auth from "../src/routes/components/authControllers";
import jwt from "jsonwebtoken";

BigInt.prototype.toJSON = function() {
    return this.toString()
  } 
  
  
// Replace jwt.verify and jwt.decode with mock functions
jwt.verify = vi.fn();
jwt.decode = vi.fn();

// Mock response object
const mockRes = () => {
  const res = {
    status: vi.fn().mockReturnThis(), // Allows chaining, i.e., res.status(401).send()
    send: vi.fn(),
  };
  return res;
};

// Test: Successful token verification
test("verifyToken - success", async () => {
  const token = await Auth.getJWToken({id:0,first:'test',last:'test', email:'test@test.com'});
  const res = mockRes();
    
  // Mock jwt.verify to return a decoded payload
  (jwt.verify as jest.Mock).mockReturnValue({ id: 1 });

  const result =  await Auth.verifyToken(token, res);

  // Assertions
  expect(result).toBe(true);
});

// Test: Failed token verification (invalid token)
test("verifyToken - failure", async () => {
  const token = "invalid-token";
  const res = mockRes();

  // Mock jwt.verify to throw an error (simulate invalid token)
  (jwt.verify as jest.Mock).mockImplementation(() => {
    throw new Error("Invalid token");
  });

  const result = Auth.verifyToken(token, res);

  // Assertions
  expect(await  result).toBe(false);
});

// Test: Successful token decoding
test("decodeToken - success", async () => {
    const token = await Auth.getJWToken({id:1, first:'test',last:'test', email:'test@test.com'});

  // Mock jwt.decode to return decoded payload
  (jwt.verify as jest.Mock).mockReturnValue({ id: 1, email: "test@test.com" });

  let result =  await Auth.decodeToken(token);
  console.error(result)
  // Assertions
  expect( result).toEqual({ id: 1, email: 'test@test.com' });
});

// Test: Failed token decoding (invalid token)
test("decodeToken - failure", async () => {
  const token = "invalid-token";

  // Mock jwt.decode to return null (invalid token)
  (jwt.verify as jest.Mock).mockReturnValue(null);

  const result = await Auth.decodeToken(token);

  // Assertions
  expect(result.error).toEqual(true);
});

// Test: Error handling in token decoding
test("decodeToken - error handling", async () => {
  const token = "error-token";

  // Mock jwt.decode to throw an error
  (jwt.decode as jest.Mock).mockImplementation(() => {
    throw new Error("Decoding error");
  });

  const result = await Auth.decodeToken(token);

  // Assertions
  expect({error:result.error} ).toEqual({ error: true,});
});