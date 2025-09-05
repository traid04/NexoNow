import express from "express";
import { User, Seller } from "../models/index";
import { tokenExtractor } from "../middleware/tokenExtractor";
import { parseNewSellerEntry, parseUpdateSellerDataEntry } from "../utils/parseInputs";
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
});

router.get('/:id', async (req, res, next) => {
  if (isNaN(Number(req.params.id))) {
    return res.status(400).json({ error: 'Seller ID must be a number' });
  }
  try {
    const seller = await Seller.findByPk(Number(req.params.id), {
      attributes: {
        exclude: ['userId']
      },
      include: {
        model: User,
        attributes: ["id", "username", "firstName", "lastName", "birthDate", "email"]
      }
    });
    if (!seller) {
      return res.status(404).json({ error: 'Seller not found' });
    }
    return res.status(200).json(seller);
  }
  catch(error) {
    next(error);
  }
});

router.post('/', tokenExtractor, async (req: RequestWithUser, res, next) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Token missing or invalid' });
  }
  try {
    const newSeller: NewSellerEntry = parseNewSellerEntry({...req.body, userId: req.user.userId});
    const insertSeller = await Seller.create(newSeller);
    return res.status(201).json(insertSeller);
  }
  catch(error) {
    next(error);
  }
});

router.delete('/:id', tokenExtractor, async (req: RequestWithUser, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Token missing or invalid' });
    }
    if (isNaN(Number(req.params.id))) {
      return res.status(400).json({ error: 'Seller ID must be a number' });
    }
    const deletedCount = await Seller.destroy({
      where: {
        id: Number(req.params.id),
        userId: req.user.userId
      }
    })
    if (deletedCount === 0) {
      return res.status(404).json({ error: 'Seller not found' });
    }
    return res.status(204).end();
  }
  catch(error) {
    next(error);
  }
});

router.patch('/:id', tokenExtractor, async (req: RequestWithUser, res, next) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Token missing or invalid' });
  }
  if (isNaN(Number(req.params.id))) {
    return res.status(400).json({ error: 'Seller ID must be a number' });
  }
  try {
    const fieldsToUpdate = parseUpdateSellerDataEntry(req.body);
    const [updatedCount] = await Seller.update(fieldsToUpdate, {
      where: {
        userId: req.user.userId,
        id: Number(req.params.id)
      }
    });
    if (updatedCount === 0) {
      return res.status(404).json({ error: 'Seller not found' });
    }
    const seller = await Seller.findByPk(Number(req.params.id));
    return res.status(200).json(seller);
  }
  catch(error) {
    next(error);
  }
});

export default router;