import express from "express";
import bcrypt from "bcrypt";
import jsonwebtoken from "jsonwebtoken";
import { parseLoginUserEntry } from "../utils/parseInputs";
import { LoginUserEntry } from "../types/types";
import { User } from "../models/index";
import { JWT_TOP_SECRET_KEY } from "../utils/config";
const router = express.Router();

router.post('/', async (req, res, next) => {
  if (!JWT_TOP_SECRET_KEY) {
    return res.status(400).json({ error: "JWT secret key cannot be undefined" })
  }
  try {
    const loginUser: LoginUserEntry = parseLoginUserEntry(req.body);
    const dbUser = await User.findOne({
      where: {
        email: loginUser.email
      }
    })
    if (!dbUser) {
      return res.status(404).json({ error: `User with email ${loginUser.email} not found` });
    }
    if (!dbUser.isVerified) {
      return res.status(401).json({ error: "You must have your account verified for log in" });
    }
    const correctPassword = await bcrypt.compare(loginUser.password, dbUser.passwordHash);
    if (!correctPassword) {
      return res.status(401).json({ error: "Incorrect password" });
    }
    const refreshToken = jsonwebtoken.sign({ userId: dbUser.id, email: dbUser.email }, JWT_TOP_SECRET_KEY, { expiresIn:'7d' });
    dbUser.refreshToken = refreshToken;
    await dbUser.save();
    const accessToken = jsonwebtoken.sign({ userId: dbUser.id }, JWT_TOP_SECRET_KEY, { expiresIn: '1h' });
    res.cookie("refreshToken", refreshToken, { signed: true, secure: true, httpOnly: true, path: "/api/refresh", sameSite: "strict" });
    return res.status(200).json({ accessToken });
  }
  catch(error) {
    next(error);
  }
});

export default router;