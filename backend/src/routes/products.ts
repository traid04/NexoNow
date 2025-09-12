import express from 'express';
import { sequelize } from '../utils/db';
import { tokenExtractor } from '../middleware/tokenExtractor';
import { Category, Product, ProductPhoto, Seller } from '../models/index';
import { fileFilter, uploadAvatar } from '../services/imagesService';
import { IDValidator } from '../middleware/IDValidator';
import { NewProductEntry, RequestWithUser } from '../types/types';
import multer from 'multer';
import { parseNewProductEntry, parseQueryParams } from '../utils/parseInputs';
import { isNumber, isPhotoArray } from '../utils/typeGuards';
import { UploadApiResponse } from 'cloudinary';
import { Op, Order, WhereOptions } from 'sequelize';
import { USDToUYU } from '../services/exchangeService';
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 3 * 1024 * 1024 },
  fileFilter
});

const router = express.Router();

router.get('/', async (req, res, next) => {
  try {
    let where: WhereOptions = {};
    let order: Order = [];
    const queryParams = parseQueryParams(req.query);
    if (!(isNumber(queryParams.offset) && isNumber(queryParams.limit))) {
      return res.status(400).json({ error: 'Limit and Offset must be numbers' });
    }
    if ('location' in queryParams && queryParams.location !== undefined) {
      where.location = { [Op.iLike]: `%${queryParams.location}%` }
    }
    if ('condition' in queryParams && queryParams.condition !== undefined) {
      where.condition = queryParams.condition;
    }
    if ('order' in queryParams) {
      if (queryParams.order === 'lowerprice') {
        order = [['priceInUyu', 'ASC']];
      }
      if (queryParams.order === 'higherprice') {
        order = [['priceInUyu', 'DESC']];
      }
      if (queryParams.order === 'mostrelevant') {
        order = [['views', 'DESC']];
      }
    }
    const min: boolean = 'minPrice' in queryParams;
    const max: boolean = 'maxPrice' in queryParams;
    if (min && max) {
      where.price = { [Op.between]: [queryParams.minPrice, queryParams.maxPrice] };
    }
    else if (min) {
      where.price = { [Op.gte]: queryParams.minPrice }
    }
    else if (max) {
      where.price = { [Op.lte]: queryParams.maxPrice }
    }
    const { count, rows: products } = await Product.findAndCountAll({
      offset: queryParams.offset,
      limit: queryParams.limit,
      where,
      order,
      attributes: { exclude: ["categoryId"] },
      include: [{
        model: Category,
        attributes: ["id", "name"]
      },
      {
        model: Seller,
        attributes: { exclude: ['userId', "createdAt", "updatedAt"] }
      }, {
        model: ProductPhoto
      }]
    });
    const totalProducts = count;
    return res.status(200).json({ products, totalProducts, totalPages: Math.ceil(totalProducts / queryParams.limit), currentPage: Math.floor(queryParams.offset / queryParams.limit) + 1 });
  }
  catch(error) {
    next(error);
  }
});

router.post('/', upload.array('photos', 40), tokenExtractor, async (req: RequestWithUser, res, next) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Token missing or invalid' });
  }
  if (!req.files) {
    return res.status(400).json({ error: 'At least 5 photos are required' })
  }
  try {
    const seller = await Seller.findOne({ where: { userId: req.user.userId } });
    if (!seller) {
      return res.status(401).json({ error: 'Must create your Seller profile' });
    }
    let productBody: NewProductEntry = {
      ...req.body,
      categoryId: parseInt(req.body.categoryId),
      price: parseFloat(req.body.price),
      priceInUyu: parseFloat(req.body.price),
      stock: parseInt(req.body.stock),
      sellerId: Number(seller.id)
    }
    if ('offerPrice' in req.body) {
      productBody.offerPrice = parseFloat(req.body.offerPrice);
    }
    const product = parseNewProductEntry(productBody);
    if (product.currency === 'USD') {
      const priceInUyu = await USDToUYU(product.price);
      if (isNumber(priceInUyu)) {
        product.priceInUyu = Number(priceInUyu.toFixed(2));
      }
      else {
        return res.status(400).json({ error: 'Invalid price type: Number expected' });
      }
    }
    if (!isPhotoArray(req.files)) {
      return res.status(400).json({ error: 'Malformatted photos entry' });
    }
    if (req.files.length < 5) {
      return res.status(400).json({ error: 'At least 5 photos are required' });
    }
    let photos: Promise<UploadApiResponse | undefined>[] = req.files.map(file => uploadAvatar(file));
    const photosApiResponse = await Promise.all(photos);
    const photosToAdd = photosApiResponse.map(photo => {
      if (!(photo && 'public_id' in photo && 'secure_url' in photo)) {
        throw new Error('Malformatted request: Cannot upload Photo');
      }
      return {
        photoId: photo.public_id,
        url: photo.secure_url
      }
    });
    const addProduct = await sequelize.transaction(async t => {
      const uploadedProduct = await Product.create(product, { transaction: t });
      for (const photo of photosToAdd) {
        const photoToAdd = {
          productId: uploadedProduct.id,
          photoId: photo.photoId,
          url: photo.url
        }
        await ProductPhoto.create(photoToAdd, { transaction: t });
      }
      return {
        product: uploadedProduct,
        photos: photosToAdd
      }
    });
    return res.status(201).json(addProduct);
  }
  catch(error) {
    next(error);
  }
});

router.get('/:id', IDValidator, async (req, res, next) => {
  try {
    const product = await Product.findByPk(Number(req.params.id), {
      attributes: { exclude: ["categoryId"] },
      include: [{
        model: Category,
        attributes: ["id", "name"]
      },
      {
        model: Seller,
        attributes: { exclude: ['userId', "createdAt", "updatedAt"] }
      }, {
        model: ProductPhoto
      }]
    })
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    await product.increment('views', { by: 1 });
    await product.reload();
    return res.status(200).json(product);
  }
  catch(error) {
    next(error);
  }
})

export default router;