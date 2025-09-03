import { Response, NextFunction } from "express";
import { RequestWithUser } from "../types/types";
import jsonwebtoken from "jsonwebtoken";
import { JWT_TOP_SECRET_KEY } from "../utils/config";
import { isObject } from "../utils/typeGuards";

export const tokenExtractor = async (req: RequestWithUser, res: Response, next: NextFunction) => {
  if (!JWT_TOP_SECRET_KEY) {
    return res.status(400).json({ error: "JWT secret key cannot be undefined" });
  }
  try {
    const authorization = req.get('authorization');
    if (authorization && authorization.toLowerCase().startsWith('bearer ')) {
      const token = authorization.replace('Bearer ', '');
      const decodedToken = jsonwebtoken.verify(token, JWT_TOP_SECRET_KEY);
      if (!(isObject(decodedToken) && 'userId' in decodedToken && 'iat' in decodedToken && 'exp' in decodedToken)) {
        return res.status(400).json({ error: 'Invalid Token structure' });
      }
      req.user = decodedToken;
    }
    else {
      return res.status(401).json({ error: 'Token missing or invalid' });
    }
    next();
  }
  catch(error) {
    next(error);
  }
}