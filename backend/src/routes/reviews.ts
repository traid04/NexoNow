import express from 'express';
import { Review, Seller, User } from '../models/index';
import { tokenExtractor } from '../middleware/tokenExtractor';
import { RequestWithUser } from '../types/types';
import { IDValidator } from '../middleware/IDValidator';
import { parseUpdateReviewEntry } from '../utils/parseInputs';
import { tokenValidator } from '../middleware/tokenValidator';
const router = express.Router();

router.get('/', async (_req, res, next) => {
  try {
    const reviews = await Review.findAll({
			attributes: {
				exclude: ["userId", "sellerId"]
			},
			include: [{
				model: User,
				attributes: ["id", "avatarPhoto", "username", "email"]
			},
			{
				model: Seller,
				attributes: ["id"]
			}]
		});
    return res.status(200).json(reviews);
  }
  catch(error) {
    next(error);
  }
});

router.get('/:id', IDValidator, async (req, res, next) => {
	try {
		const review = await Review.findByPk(Number(req.params.id), {
			attributes: {
				exclude: ["userId", "sellerId"]
			},
			include: [{
				model: User,
				attributes: ["id", "avatarPhoto", "username", "email"]
			},
			{
				model: Seller,
				attributes: ["id"]
			}]
		});
		if (!review) {
			return res.status(404).json({ error: 'Review not found' });
		}
		res.status(200).json(review);
	}
	catch(error) {
		next(error);
	}
})

router.delete('/:id', IDValidator, tokenExtractor, tokenValidator, async (req: RequestWithUser, res, next) => {
	try {
		const reqUser = req.user!;
		const reviewToDelete = await Review.findByPk(Number(req.params.id));
		if (!reviewToDelete) {
			return res.status(404).json({ error: 'Review not found' });
		}
		if (reviewToDelete.userId !== reqUser.userId) {
			return res.status(401).json({ error: "Cannot delete another user's review" });
		}
		await reviewToDelete.destroy();
		return res.status(204).end();
	}
	catch(error) {
		next(error);
	}
});

router.patch('/:id', IDValidator, tokenExtractor, tokenValidator, async (req: RequestWithUser, res, next) => {
	try {
		const reqUser = req.user!;
		const reviewToUpdate = await Review.findByPk(Number(req.params.id));
		if (!reviewToUpdate) {
			return res.status(404).json({ error: 'Review not found' })
		}
		if (reqUser.userId !== reviewToUpdate.userId) {
			return res.status(401).json({ error: "Cannot update another user's review" });
		}
		const parsedUpdate = parseUpdateReviewEntry(req.body);
		if (parsedUpdate.rating && (parsedUpdate.rating < 1 || parsedUpdate.rating > 5)) {
			return res.status(400).json({ error: 'Rating must be between 1 and 5' });
		}
		const updatedReview = await reviewToUpdate.update(parsedUpdate);
		return res.status(200).json(updatedReview);
	}
	catch(error) {
		next(error);
	}
});

export default router;