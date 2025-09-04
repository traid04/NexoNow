import express from "express";
import { User, Seller } from "../models/index";
import { tokenExtractor } from "../middleware/tokenExtractor";
import { parseNewSellerEntry } from "../utils/parseInputs";
import { NewSellerEntry, RequestWithUser } from "../types/types";

const router = express.Router();

router.get('/', async (_req, res, next) => {
  try {
    const sellers = await Seller.findAll({
      attributes: {
        exclude: ['userId']
      },
      include: {
        model: User,
        attributes: {
          exclude: ['verifyToken', 'passwordHash', 'refreshToken', 'createdAt', 'updatedAt']
        }
      }
    });
    return res.status(200).json(sellers);
  }
  catch(error) {
    next(error);
  }
})

router.post('/', tokenExtractor, async (req: RequestWithUser, res, next) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Token not found' });
  }
  try {
    const newSeller: NewSellerEntry = parseNewSellerEntry({...req.body, userId: req.user.userId});
    const insertSeller = await Seller.create(newSeller);
    return res.status(201).json(insertSeller);
  }
  catch(error) {
    next(error);
  }
})

router.delete('/:id', tokenExtractor, async (req: RequestWithUser, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Token not found' });
    }
    if (isNaN(Number(req.params.id))) {
      return res.status(400).json({ error: 'Invalid User ID' });
    }
    const deletedCount = await Seller.destroy({
      where: {
        id: Number(req.params.id),
        userId: req.user.userId
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

export default router;