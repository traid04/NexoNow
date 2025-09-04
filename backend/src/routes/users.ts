import { Seller, User } from "../models/index";
import express, { Router } from "express";
import { NewUserEntry, SecureNewUserEntry, NewVerifyUserEntry, RequestWithUser } from "../types/types";
import { parseVerifyUserEntry, parseNewUserEntry } from "../utils/parseInputs";
import bcrypt from "bcrypt";
import { JWT_TOP_SECRET_KEY } from "../utils/config";
import jsonwebtoken from 'jsonwebtoken';
import { sendVerificationMail } from "../services/mailService";
import { isObject } from "../utils/typeGuards";
import { tokenExtractor } from "../middleware/tokenExtractor";
const router: Router = express.Router();

router.get("/", async (_req, res, next) => {
  try {
    const users = await User.findAll({
      attributes: ["id", "username", "firstName", "lastName", "birthDate", "email"],
      include: {
        model: Seller,
        attributes: {
          exclude: ['userId', 'createdAt', 'updatedAt']
        }
      }
    })
    return res.status(200).json(users);
  }
  catch(error) {
    next(error);
  }
});

router.post("/", async (req, res) => {
  if (!JWT_TOP_SECRET_KEY) {
    return res.status(400).json({ error: "JWT secret key cannot be undefined" });
  }
  try {
    const userEntry: NewUserEntry = parseNewUserEntry(req.body);
    const passwordHash = await bcrypt.hash(userEntry.password, 10);
    const verifyToken = jsonwebtoken.sign({ email: userEntry.email }, JWT_TOP_SECRET_KEY, { expiresIn:'1d' });
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
  catch(error: unknown) {
    if (error instanceof Error) {
      return res.status(400).json({ error: error.message });
    }
    else {
      return res.status(400).json({ error: `Unknown error: ${error}` });
    }
  }
});

router.delete('/:id', tokenExtractor, async (req: RequestWithUser, res, next) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Token not found' });
  }
  try {
    if (Number(req.params.id) !== Number(req.user.userId)) {
      return res.status(401).json({ error: 'Cannot delete a different account than yours' });
    }
    if (isNaN(Number(req.params.id))) {
      return res.status(400).json({ error: 'Invalid User ID' });
    }
    const deletedCount = await User.destroy({
      where: {
        id: Number(req.params.id),
      }
    })
    if (deletedCount === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    return res.status(204).end();
  }
  catch(error) {
    next(error);
  }
})

router.get('/verify/:token', async (req, res, next) => {
  if (!JWT_TOP_SECRET_KEY) {
    return res.status(400).json({ error: "JWT secret key cannot be undefined" });
  }
  try {
    const decodedToken = jsonwebtoken.verify(req.params.token, JWT_TOP_SECRET_KEY);
    const user = await User.findOne({
      where: {
        verifyToken: req.params.token
      }
    })
    const correctToken = isObject(decodedToken) && 'email' in decodedToken;
    if (user && user.isVerified) {
      user.verifyToken = '';
      await user.save();
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
});

router.post('/verify/expired', async (req, res, next) => {
  if (!JWT_TOP_SECRET_KEY) {
    return res.status(400).json({ error: "Invalid JWT, secret key cannot be undefined" });
  }
  try {
    const { username, email, password }: NewVerifyUserEntry = parseVerifyUserEntry(req.body);
    const userToVerify = await User.findOne({
      where: {
        username,
        email
      }
    })
    if (!userToVerify) {
      return res.status(404).json({ error: 'User not found, invalid username or email' });
    }
    const decryptedPassword = await bcrypt.compare(password, userToVerify.passwordHash);
    if (!decryptedPassword) {
      return res.status(401).json({ error: 'Incorrect password' });
    }
    const newToken = jsonwebtoken.sign({ email }, JWT_TOP_SECRET_KEY, { expiresIn: '1d' });
    userToVerify.verifyToken = newToken;
    await userToVerify.save();
    await sendVerificationMail(userToVerify.firstName, userToVerify.email, newToken, false);
    return res.status(200).json({ message: 'Verification email sent' });
  }
  catch(error) {
    next(error);
  }
})

export default router;
