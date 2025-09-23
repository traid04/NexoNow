import express from 'express';
import { tokenExtractor } from '../middleware/tokenExtractor';
import { RequestWithUser } from '../types/types';
import { Favorite } from '../models/index';
import { IDValidator } from '../middleware/IDValidator';

const router = express.Router();

router.post('/:id', IDValidator, tokenExtractor, async (req: RequestWithUser, res, next) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Token missing or invalid' });
  }
  try {
    const body = {
      userId: req.user.userId,
      productId: Number(req.params.id)
    };
    const favorite = await Favorite.findOne({ where: body });
    if (favorite) {
      return res.status(409).json({ error: "This product has already been favorited" });
    }
    const savedFavorite = await Favorite.create(body);
    return res.status(201).json(savedFavorite);
  }
  catch(error) {
    next(error);
  }
});

router.delete('/:id', IDValidator, tokenExtractor, async (req: RequestWithUser, res, next) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Token missing or invalid' });
  }
  try {
    const favToRemove = await Favorite.findOne({ where: { userId: req.user.userId, productId: Number(req.params.id) } });
    if (!favToRemove) {
      return res.status(404).json({ error: "Favorite not found" });
    }
    await favToRemove.destroy();
    return res.status(204).end();
  }
  catch(error) {
    next(error);
  }
});

export default router;