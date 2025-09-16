import express from 'express';
import { sequelize } from '../utils/db';
import { tokenExtractor } from '../middleware/tokenExtractor';
import { Category, Product, ProductPhoto, Seller } from '../models/index';
import { deletePhoto, fileFilter, uploadPhoto } from '../services/imagesService';
import { IDValidator } from '../middleware/IDValidator';
import { NewProductEntry, RequestWithUser } from '../types/types';
import multer from 'multer';
import { parseCreateOfferEntry, parseNewProductEntry, parseProductUpdateEntry, parseQueryParams, parseString } from '../utils/parseInputs';
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
        attributes: ["id", "name"],
      },
      {
        model: Seller,
        attributes: { exclude: ['userId', "createdAt", "updatedAt"] },
      }, {
        model: ProductPhoto
      }],
      distinct: true
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
    let photos: Promise<UploadApiResponse | undefined>[] = req.files.map(file => uploadPhoto(file));
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
});

router.delete('/:id', IDValidator, tokenExtractor, async (req: RequestWithUser, res, next) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Token missing or invalid' });
  }
  try {
    const seller = await Seller.findOne({ where: { userId: req.user.userId } });
    if (!seller) {
      return res.status(403).json({ error: "You cannot delete products from other sellers" });
    }
    const productToDelete = await Product.findByPk(Number(req.params.id));
    if (!productToDelete) {
      return res.status(404).json({ error: 'Product not found' });
    }
    if (productToDelete.sellerId !== seller.id) {
      return res.status(403).json({ error: "The product to delete must be yours" });
    }
    const productPhotosToDelete = await ProductPhoto.findAll({ where: { productId: productToDelete.id } });
    for (const photo of productPhotosToDelete) {
      await deletePhoto(photo.photoId);
    }
    await productToDelete.destroy();
    return res.status(204).end();
  }
  catch(error) {
    next(error);
  }
});

router.patch('/:id', IDValidator, tokenExtractor, async (req: RequestWithUser, res, next) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Token missing or invalid' });
  }
  try {
    const seller = await Seller.findOne({ where: { userId: req.user.userId } });
    if (!seller) {
      return res.status(403).json({ error: "You cannot update products from other sellers" });
    }
    const product = await Product.findByPk(Number(req.params.id));
    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }
    const fieldsToUpdate = req.body;
    if ('newCategory' in fieldsToUpdate) {
      const category = await Category.findOne({ where: { name: fieldsToUpdate.newCategory } });
      if (!category) {
        return res.status(400).json({ error: "New Category not found" });
      }
      fieldsToUpdate.categoryId = category.id;
    }
    const parsedUpdate = parseProductUpdateEntry(fieldsToUpdate);
    if ('price' in parsedUpdate && 'currency' in parsedUpdate) {
      if (isNumber(parsedUpdate.price) && parsedUpdate.currency === 'USD') {
        parsedUpdate.priceInUyu = await USDToUYU(parsedUpdate.price);
      }
      else if (isNumber(parsedUpdate.price) && parsedUpdate.currency === 'UYU') {
        parsedUpdate.priceInUyu = parsedUpdate.price;
      }
    }
    const [updatedCount] = await Product.update(parsedUpdate, {
      where: {
        id: product.id,
        sellerId: seller.id
      }
    });
    if (updatedCount === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }
    await product.reload();
    return res.status(200).json(product);
  }
  catch(error) {
    next(error);
  }
});

router.patch('/:id/photos/:photoId', IDValidator, tokenExtractor, upload.single('photoToUpdate'), async (req: RequestWithUser, res, next) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Token missing or invalid' });
  }
  if (!req.file) {
    return res.status(400).json({ error: 'New photo required' });
  }
  try {
    const photoId = parseString(req.params.photoId);
    const productId = Number(req.params.id);
    const photoToUpdate = await ProductPhoto.findOne({ where: { photoId, productId } });
    if (!photoToUpdate) {
      return res.status(404).json({ error: 'Photo not found' });
    }
    const uploadedPhoto = await uploadPhoto(req.file);
    if (!uploadedPhoto || !("secure_url" in uploadedPhoto) || !("public_id" in uploadedPhoto)) {
      return res.status(409).json({ error: 'Malformatted request: Cannot upload Photo' });
    }
    photoToUpdate.photoId = uploadedPhoto.public_id;
    photoToUpdate.url = uploadedPhoto.secure_url;
    await photoToUpdate.save();
    await deletePhoto(photoId);
    return res.status(200).json(photoToUpdate);
  }
  catch(error) {
    next(error);
  }
});

router.patch('/:id/createOffer', IDValidator, tokenExtractor, async (req: RequestWithUser, res, next) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Token missing or invalid' });
  }
  try {
    const product = await Product.findByPk(Number(req.params.id));
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    const parsedOffer = parseCreateOfferEntry(req.body);
    let offerPriceInUyu: number | undefined = parsedOffer.offerPrice;
    if (product.currency === "USD") {
      offerPriceInUyu = await USDToUYU(parsedOffer.offerPrice);
      if (typeof offerPriceInUyu !== "number") {
        return res.status(400).json({ error: "Exchange error" });
      }
    }
    if (offerPriceInUyu >= product.priceInUyu) {
      return res.status(400).json({ error: "The discount price cannot be higher than the original price" });
    }
    const startOfferDate = new Date(parsedOffer.startOfferDate);
    const endOfferDate = new Date(parsedOffer.endOfferDate);
    if (startOfferDate.getTime() >= endOfferDate.getTime()) {
      return res.status(400).json({ error: "The start offer date cannot be equal to or after the end offer date" })
    }
    if (startOfferDate.getTime() < Date.now() || endOfferDate.getTime() < Date.now()) {
      return res.status(400).json({ error: "The start or end offer date cannot be before this moment" });
    }
    product.activeOffer = true;
    product.offerPrice = parsedOffer.offerPrice;
    product.offerPriceInUyu = offerPriceInUyu;
    product.startOfferDate = startOfferDate.toISOString();
    product.endOfferDate = endOfferDate.toISOString();
    await product.save();
    const discountPercentage = ((product.priceInUyu - offerPriceInUyu) / product.priceInUyu) * 100;
    let returnedOffer = {
      originalOfferPrice: product.currency === "USD" ? parseFloat(product.offerPrice.toFixed(2)) : parseFloat(product.offerPriceInUyu.toFixed(2)),
      offerPriceInUyu: parseFloat(product.offerPriceInUyu.toFixed(2)),
      startOfferDate: product.startOfferDate,
      endOfferDate: product.endOfferDate,
      discountPercentage: parseFloat(discountPercentage.toFixed(2))
    };
    return res.status(200).json(returnedOffer);
  }
  catch(error) {
    next(error);
  }
});

export default router;