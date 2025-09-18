import jsonwebtoken from 'jsonwebtoken';
import { RequestWithUser } from '../types/types';
import { JWT_TOP_SECRET_KEY } from '../utils/config';
import { isObject } from '../utils/typeGuards';
import { NextFunction, Response } from 'express';

export const optionalTokenExtractor = async (req: RequestWithUser, res: Response, next: NextFunction) => {
  if (!JWT_TOP_SECRET_KEY) {
    return res.status(400).json({ error: 'JWT secret key cannot be undefined' });
  }
  try {
    const authorization = req.get('authorization');
    if (authorization && authorization.toLowerCase().startsWith('bearer ')) {
      const decodedToken = jsonwebtoken.verify(authorization.replace('Bearer ', ''), JWT_TOP_SECRET_KEY);
      if (!(isObject(decodedToken) && 'userId' in decodedToken && 'iat' in decodedToken && 'exp' in decodedToken)) {
        return res.status(401).json({ error: '' })
      }
      req.user = decodedToken;
    }
    next();
  }
  catch(error) {
    next(error);
  }
}