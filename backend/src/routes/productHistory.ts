import { tokenExtractor } from "../middleware/tokenExtractor";
import { Product, ProductHistory, User } from "../models";
import express from 'express';
import { RequestWithUser } from "../types/types";
import { Op } from "sequelize";
import { tokenValidator } from "../middleware/tokenValidator";
const router = express.Router();

router.get('/recommendations', tokenExtractor, tokenValidator, async (req: RequestWithUser, res, next) => {
  try {
    const reqUser = req.user!;
    const user = await User.findByPk(reqUser.userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    const recentHistory = await ProductHistory.findAll({
      limit: 10,
      order: [["createdAt", "DESC"]],
      where: {
        userId: user.id
      },
      include: {
        model: Product
      }
    });
    const ids = [...new Set(recentHistory.map(product => product.toJSON().product.id))];
    const categories = [...new Set(recentHistory.map(product => product.toJSON().product.categoryId))];
    const recommendations = await Product.findAll({
      limit: 15,
      where: {
        categoryId: { [Op.in]: categories },
        id: { [Op.notIn]: ids }
      },
    });
    return res.status(200).json(recommendations);
  }
  catch(error) {
    next(error);
  }
});

export default router;