import express from 'express';
import { Category } from '../models';

const router = express.Router();

router.get('/', async (_req, res, next) => {
  try {
    const categories = await Category.findAll({});
    return res.status(200).json(categories);
  }
  catch(error) {
    next(error);
  }
});

export default router;