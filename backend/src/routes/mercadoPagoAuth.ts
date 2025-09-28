import express from 'express';
import { tokenExtractor } from '../middleware/tokenExtractor';
import { RequestWithUser } from '../types/types';
import { User } from '../models/index';
import { MP_APP_ID } from '../utils/config';
import { MP_REDIRECT_URL } from '../utils/config';
import { v4 as uuidv4 } from 'uuid';
import { tokenValidator } from '../middleware/tokenValidator';

const router = express.Router();

router.get('/', tokenExtractor, tokenValidator, async (req: RequestWithUser, res) => {
  const reqUser = req.user!;
  const uuid: string = `${uuidv4()}-${reqUser.userId}`;
  const user = await User.findByPk(reqUser.userId);
  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }
  user.mpState = uuid;
  await user.save();
  const url = `https://auth.mercadopago.com/authorization?client_id=${MP_APP_ID}&response_type=code&platform_id=mp&state=${uuid}&redirect_uri=${MP_REDIRECT_URL}`;
  res.redirect(url);
});

export default router;