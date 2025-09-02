import { User } from "../models/index";
import express, { Router } from "express";
import { NewUserEntry, SecureNewUserEntry, NewVerifyUserEntry } from "../types/types";
import { parseLoginUserEntry, parseNewUserEntry } from "../utils/parseInputs";
import bcrypt from 'bcrypt';
import { JWT_TOP_SECRET_KEY } from "../utils/config";
import jsonwebtoken from 'jsonwebtoken';
import { sendVerificationMail } from "../services/mailService";
import { isObject } from "../utils/typeGuards";
const router: Router = express.Router();

router.get("/", async (_req, res) => {
  const users: User[] = await User.findAll({
    attributes: ["id", "username", "firstName", "lastName", "birthDate", "email"]
  });
  res.status(200).json(users);
});

router.post("/", async (req, res) => {
  try {
    const userEntry: NewUserEntry = parseNewUserEntry(req.body);
    const passwordHash: string = await bcrypt.hash(userEntry.password, 10);
    if (JWT_TOP_SECRET_KEY) {
      const verifyToken = jsonwebtoken.sign({ email: userEntry.email }, JWT_TOP_SECRET_KEY, { expiresIn: '1d' });
      const userToAdd = {
        username: userEntry.username,
        firstName: userEntry.firstName,
        lastName: userEntry.lastName,
        birthDate: userEntry.birthDate,
        email: userEntry.email,
        isVerified: false,
        verifyToken,
        passwordHash
      }
      await User.create(userToAdd);
      const user: SecureNewUserEntry = {
        username: userToAdd.username,
        firstName: userToAdd.firstName,
        lastName: userToAdd.lastName,
        birthDate: userToAdd.birthDate,
      };
      await sendVerificationMail(userToAdd.firstName, userToAdd.email, verifyToken, true);
      return res.status(201).json(user);
    }
    return res.status(400).json({ error: "Invalid JWT, secret key cannot be undefined" });
  }
  catch(error: unknown) {
    if (error instanceof Error) {
      return res.status(400).json({ error: error.message });
    }
    else {
      return res.status(400).json({ error: `Unknown error: ${error}` });
    }
  }
});

router.get('/verify/:token', async (req, res, next) => {
  if (JWT_TOP_SECRET_KEY) {
    try {
      const decodedToken = jsonwebtoken.verify(req.params.token, JWT_TOP_SECRET_KEY);
      const user = await User.findOne({
        where: {
          verifyToken: req.params.token
        }
      })
      const correctToken = isObject(decodedToken) && 'email' in decodedToken;
      if (user && user.isVerified) {
        return res.status(400).json({ error: 'Account already verified' });
      }
      if (!correctToken) {
        return res.status(400).json({ error: 'Invalid Token structure' });
      }
      if (user && user.email === decodedToken.email) {
        user.isVerified = true;
        user.verifyToken = '';
        await user.save();
        return res.status(200).json({ status: 'verified' });
      }
      return res.status(404).json({ error: 'User not found, invalid Token' });
    }
    catch(error) {
      next(error);
    }
  }
  return res.status(400).json({ error: "JWT secret key cannot be undefined" });
});

router.post('/verify/expired', async (req, res, next) => {
  try {
    const { username, email, password }: NewVerifyUserEntry = parseLoginUserEntry(req.body);
    const userToVerify = await User.findOne({
      where: {
        username,
        email
      }
    })
    if (userToVerify) {
      const decryptedPassword = await bcrypt.compare(password, userToVerify.passwordHash);
      if (decryptedPassword) {
        if (JWT_TOP_SECRET_KEY) {
          const newToken = jsonwebtoken.sign({ email }, JWT_TOP_SECRET_KEY, { expiresIn: '1d' });
          userToVerify.verifyToken = newToken;
          await userToVerify.save();
          await sendVerificationMail(userToVerify.firstName, userToVerify.email, newToken, false);
          return res.status(200).json({ message: 'Verification email sent' });
        }
        else {
          return res.status(400).json({ error: "Invalid JWT, secret key cannot be undefined" });
        }
      }
      else {
        return res.status(401).json({ error: 'Incorrect password' });
      }
    }
    return res.status(404).json({ error: 'User not found, invalid username or email' });
  }
  catch(error) {
    next(error);
  }
})

export default router;
