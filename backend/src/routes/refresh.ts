import express from "express";
import jsonwebtoken from "jsonwebtoken";
import { User } from "../models/index";
import { JWT_TOP_SECRET_KEY } from "../utils/config";
import { isObject } from "../utils/typeGuards";
const router = express.Router();

router.post("/", async (req, res, next) => {
  if (!JWT_TOP_SECRET_KEY) {
    return res.status(400).json({ error: "JWT secret key cannot be undefined" });
  }
  try {
    const decodedToken = jsonwebtoken.verify(req.signedCookies.refreshToken, JWT_TOP_SECRET_KEY);
    if (!(isObject(decodedToken) && 'userId' in decodedToken && 'email' in decodedToken)) {
      return res.status(400).json({ error: 'Invalid Token structure' });
    }
    const user = await User.findOne({
      where: {
        id: decodedToken.userId,
        email: decodedToken.email,
        refreshToken: req.signedCookies.refreshToken
      }
    })
    if (!user) {
      return res.status(404).json({ error: 'User not found, invalid Token' });
    }
    const newAccessToken = jsonwebtoken.sign({ userId: user.id }, JWT_TOP_SECRET_KEY, { expiresIn: '1h' });
    const newRefreshToken = jsonwebtoken.sign({ userId: user.id, email: user.email }, JWT_TOP_SECRET_KEY, { expiresIn: '7d' });
    res.cookie("refreshToken", newRefreshToken, { signed: true, secure: true, httpOnly: true, path: "/api/refresh", sameSite: "strict" });
    user.refreshToken = newRefreshToken;
    await user.save();
    res.status(200).json({ accessToken: newAccessToken });
  }
  catch(error) {
    if (error instanceof jsonwebtoken.TokenExpiredError) {
      return res.status(401).json({ error: 'Invalid session, please log in your account again' })
    }
    next(error);
  }
})

export default router;