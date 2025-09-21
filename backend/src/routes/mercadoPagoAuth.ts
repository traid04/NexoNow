import express from 'express';
import { tokenExtractor } from '../middleware/tokenExtractor';
import { RequestWithUser } from '../types/types';
import { User } from '../models/index';
import { MP_APP_ID } from '../utils/config';
import { MP_REDIRECT_URL } from '../utils/config';
import { v4 as uuidv4 } from 'uuid';

const router = express.Router();

router.get('/mp', tokenExtractor, async (req: RequestWithUser, res) => {
  if (!req.user) {
    return res.status(401).json({ error: "Token missing or invalid" });
  }
  const uuid: string = `${uuidv4()}-${req.user.userId}`;
  const user = await User.findByPk(req.user.userId);
  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }
  user.mpState = uuid;
  await user.save();
  const url = `https://auth.mercadopago.com/authorization?client_id=${MP_APP_ID}&response_type=code&platform_id=mp&state=${uuid}&redirect_uri=${MP_REDIRECT_URL}`;
  res.redirect(url);
});

export default router;