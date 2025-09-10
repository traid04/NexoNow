import express from 'express';
import { sequelize } from '../utils/db';
import { tokenExtractor } from '../middleware/tokenExtractor';
import { Category, Product, ProductPhoto, Seller } from '../models/index';
import { fileFilter, uploadAvatar } from '../services/imagesService';
// import { IDValidator } from '../middleware/IDValidator';
import { NewProductEntry, RequestWithUser } from '../types/types';
import multer from 'multer';
import { parseNewProductEntry } from '../utils/parseInputs';
import { isPhotoArray } from '../utils/typeGuards';
import { UploadApiResponse } from 'cloudinary';
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 3 * 1024 * 1024 },
  fileFilter
});

const router = express.Router();

router.get('/', async (_req, res, next) => {
  try {
    const products = await Product.findAll({
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
    return res.status(200).json(products);
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
      stock: parseInt(req.body.stock),
      sellerId: Number(seller.id)
    }
    if ('offerPrice' in req.body) {
      productBody.offerPrice = parseFloat(req.body.offerPrice);
    }
    const product = parseNewProductEntry(productBody);
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
        throw new Error('Photos upload failed');
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

export default router;