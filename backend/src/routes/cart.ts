import express from 'express';
import { tokenExtractor } from '../middleware/tokenExtractor';
import { IDValidator } from '../middleware/IDValidator';
import { CartEntry, RequestWithUser } from '../types/types';
import { parseNumber } from '../utils/parseInputs';
import { Cart, Product } from '../models/index';
import { tokenValidator } from '../middleware/tokenValidator';

const router = express.Router();

router.post('/:id', IDValidator, tokenExtractor, tokenValidator, async (req: RequestWithUser, res, next) => {
  try {
    const user = req.user!;
    const product = await Product.findByPk(Number(req.params.id));
    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }
    if (product.stock === 0) {
      return res.status(400).json({ error: "This product is out of stock" });
    }
    const productInCart = await Cart.findOne({
      where: {
        productId: Number(req.params.id),
        userId: user.userId
      }
    });
    if (!productInCart) {
      const body: CartEntry = {
        productId: parseNumber(Number(req.params.id)),
        userId: user.userId,
        quantity: 1
      }
      const newProductInCart = await Cart.create(body);
      return res.status(201).json(newProductInCart);
    }
    productInCart.quantity += 1;
    if (productInCart.quantity > product.stock) {
      return res.status(400).json({ error: `Cannot add more units of this product: Only ${product.stock} units available` });
    }
    await productInCart.save();
    return res.status(200).json(productInCart);
  }
  catch(error) {
    next(error);
  }
});

router.delete('/:id', IDValidator, tokenExtractor, tokenValidator, async (req: RequestWithUser, res, next) => {
  try {
    const user = req.user!;
    const productInCart = await Cart.findOne({
      where: {
        userId: user.userId,
        productId: Number(req.params.id)
      }
    });
    if (!productInCart) {
      return res.status(404).json({ error: "Product not found in Cart" });
    }
    await productInCart.destroy();
    return res.status(204).end();
  }
  catch(error) {
    next(error);
  }
});

router.patch('/:id', IDValidator, tokenExtractor, tokenValidator, async (req: RequestWithUser, res, next) => {
  try {
    const user = req.user!;
    const product = await Product.findByPk(Number(req.params.id));
    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }
    if (product.stock === 0) {
      return res.status(400).json({ error: "This product is out of stock" });
    }
    const productInCart = await Cart.findOne({
      where: {
        userId: user.userId,
        productId: Number(req.params.id)
      }
    });
    if (!productInCart) {
      return res.status(404).json({ error: "Product not found" });
    }
    const quantity = parseNumber(req.body.quantity);
    if (quantity === 0) {
      await productInCart.destroy();
      return res.status(204).end();
    }
    if (quantity < 0) {
      return res.status(400).json({ error: "Cannot add negative units" });
    }
    productInCart.quantity = quantity;
    if (product && productInCart.quantity > product.stock) {
      return res.status(400).json({ error: `Cannot add more units of this product: Only ${product.stock} units available` });
    }
    await productInCart.save();
    return res.status(200).json(productInCart);
  }
  catch(error) {
    next(error)
  }
});

export default router;