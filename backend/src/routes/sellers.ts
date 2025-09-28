import express from "express";
import { fn, col } from "sequelize";
import { User, Seller, Review } from "../models/index";
import { tokenExtractor } from "../middleware/tokenExtractor";
import { parseNewReviewEntry, parseNewSellerEntry, parseUpdateSellerDataEntry } from "../utils/parseInputs";
import { NewReviewEntry, NewSellerEntry, RequestWithUser } from "../types/types";
import { IDValidator } from "../middleware/IDValidator";
import { tokenValidator } from "../middleware/tokenValidator";

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
          exclude: ['avatarId', 'isVerified', 'verifyToken', 'passwordHash', 'refreshToken', 'createdAt', 'updatedAt']
        }
      }
    });
    return res.status(200).json(sellers);
  }
  catch(error) {
    next(error);
  }
});

router.get('/:id', IDValidator, async (req, res, next) => {
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

router.post('/', tokenExtractor, tokenValidator, async (req: RequestWithUser, res, next) => {
  try {
    const reqUser = req.user!;
    const newSeller: NewSellerEntry = parseNewSellerEntry({...req.body, userId: reqUser.userId});
    const insertSeller = await Seller.create(newSeller);
    return res.status(201).json(insertSeller);
  }
  catch(error) {
    next(error);
  }
});

router.delete('/:id', IDValidator, tokenExtractor, tokenValidator, async (req: RequestWithUser, res, next) => {
  try {
    const reqUser = req.user!;
    const deletedCount = await Seller.destroy({
      where: {
        id: Number(req.params.id),
        userId: reqUser.userId
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

router.patch('/:id', IDValidator, tokenExtractor, tokenValidator, async (req: RequestWithUser, res, next) => {
  try {
    const reqUser = req.user!;
    const fieldsToUpdate = parseUpdateSellerDataEntry(req.body);
    const [updatedCount] = await Seller.update(fieldsToUpdate, {
      where: {
        userId: reqUser.userId,
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

router.get('/:id/reviews', IDValidator, async (req, res, next) => {
  try {
    const seller = await Seller.findByPk(Number(req.params.id));
    if (!seller) {
      return res.status(404).json({ error: 'Seller not found' });
    }
    const sellerReviews = await Review.findAll({
      where: {
        sellerId: Number(req.params.id)
      },
      include: {
        model: User,
        attributes: ["id", "username", "avatarPhoto"]
      }
    })
    return res.status(200).json(sellerReviews);
  }
  catch(error) {
    next(error);
  }
});

router.post('/:id/reviews', IDValidator, tokenExtractor, tokenValidator, async (req: RequestWithUser, res, next) => {
  try {
    const reqUser = req.user!;
    const hasReviews = await Review.findOne({ where: { userId: reqUser.userId, sellerId: Number(req.params.id) } });
    if (hasReviews) {
      return res.status(409).json({ error: 'User has already reviewed this seller' });
    }
    const newReview: NewReviewEntry = parseNewReviewEntry({ ...req.body, userId: reqUser.userId, sellerId: Number(req.params.id) });
    if (newReview.rating < 1 || newReview.rating > 5) {
      return res.status(400).json({ error: 'Rating must be between 1 and 5' });
    }
    const addReview = await Review.create(newReview);
    const review = await Review.findByPk(addReview.id, {
      include: {
        model: User,
        attributes: ['id', 'username', 'avatarPhoto']
      }
    });
    return res.status(201).json(review);
  }
  catch(error) {
    next(error);
  }
});

router.get('/:id/reviews/averageRating', IDValidator, async (req: RequestWithUser, res, next) => {
  try {
    const seller = await Seller.findByPk(Number(req.params.id));
    if (!seller) {
      return res.status(404).json({ error: 'Seller not found' });
    }
    const averageRating = await Review.findOne({
      where: {
        sellerId: Number(req.params.id)
      },
      attributes: [
        [fn('AVG', col('rating')), 'averageRating']
      ],
    });
    if (!averageRating) {
      return res.status(404).json({ error: 'This Seller does not have reviews' })
    }
    const average = averageRating.toJSON();
    const averageToNumber = average.averageRating !== null ? parseFloat(average.averageRating) : 0;
    return res.status(200).json({ averageRating: averageToNumber });
  }
  catch(error) {
    next(error);
  }
});

export default router;