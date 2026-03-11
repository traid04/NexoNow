import supertest from 'supertest';
import { app } from '../index';
import { sequelize } from '../utils/db';
import { User, Seller, Category, Product, ProductPhoto } from '../models/index';
import { createUser } from './helpers/createUser';
import { loginUser } from './helpers/loginUser';
import { deletePhoto } from '../services/imagesService';
import { createProduct } from './helpers/createProduct';

const api = supertest(app);

beforeAll(async () => {
  await sequelize.authenticate();
  const firstUserBody = {
    username: "initialDBAccount",
    firstName: "first",
    lastName: "acc",
    email: "firstAccountInDB@yopmail.com",
    birthDate: "10-2-2025",
    password: "firsttest"
  };
  await createUser(api, firstUserBody);
  const firstUser = await User.findOne({ where: { username: firstUserBody.username } });
  firstUser!.isVerified = true;
  await firstUser!.save();
  await Seller.create({
    userId: firstUser!.id,
    department: "First User Department",
    city: "First User City",
    address: "First User Address"
  });
  const secondUserBody = {
    username: "UserWithoutSellerProfile",
    firstName: "Second",
    lastName: "Acc",
    email: "secondAccount@yopmail.com",
    birthDate: "10-2-2025",
    password: "secondtest"
  };
  await createUser(api, secondUserBody);
  const secondUser = await User.findOne({ where: { username: secondUserBody.username } });
  secondUser!.isVerified = true;
  await secondUser!.save();
  await Category.create({ name: 'Consolas y Videojuegos' })
}, 20000);

afterAll(async () => {
  const productPhotos = await ProductPhoto.findAll();
  for (const p of productPhotos) {
    await deletePhoto(p.photoId);
  }
  const users = await User.findAll();
  await User.destroy({ where: { } });
  for (const u of users) {
    await deletePhoto(u.avatarId);
  }
  await Product.destroy({ where: { } });
  await Category.destroy({ where: { } }); 
  await Seller.destroy({ where: { } });
  await sequelize.close();
}, 15000);

describe('User', () => {
  it('cannot create product without a seller profile created', async () => {
    const { body } = await loginUser(api, "secondAccount@yopmail.com", "secondtest");
    expect(body.accessToken).toBeDefined();
    const category = await Category.findOne({ where: { name: "Consolas y Videojuegos" } });
    const productBody = {
      name: 'PlayStation 5',
      price: 850,
      currency: 'USD',
      stock: 50,
      location: 'Cordón',
      categoryId: category!.id,
      condition: 'new'
    }
    const response = await createProduct(api, productBody, body.accessToken);
    expect(response.status).toBe(401);
    expect(response.body).toEqual({ error: 'Must create your Seller profile' });
  });

  it('cannot create a product without uploading an amount of minimum 5 photos', async () => {
    const { body } = await loginUser(api, "firstAccountInDB@yopmail.com", "firsttest");
    expect(body.accessToken).toBeDefined();
    const category = await Category.findOne({ where: { name: "Consolas y Videojuegos" } });
    const productBody = {
      name: 'PlayStation 5',
      price: 850,
      currency: 'USD',
      stock: 50,
      location: 'Cordón',
      categoryId: category!.id,
      condition: 'new'
    }
    const request = await api
      .post('/api/products')
      .set('Authorization', `Bearer ${body.accessToken}`)
      .field('name', productBody.name)
      .field('price', productBody.price)
      .field('currency', productBody.currency)
      .field('stock', productBody.stock)
      .field('location', productBody.location)
      .field('categoryId', productBody.categoryId)
      .field('condition', productBody.condition);
    expect(request.status).toBe(400);
    expect(request.body).toEqual({ error: 'At least 5 photos are required' });
  });

  it('can create a product', async () => {
    const { body } = await loginUser(api, "firstAccountInDB@yopmail.com", "firsttest");
    expect(body.accessToken).toBeDefined();
    const category = await Category.findOne({ where: { name: "Consolas y Videojuegos" } });
    const productBody = {
      name: 'PlayStation 5',
      price: 850,
      currency: 'USD',
      stock: 50,
      location: 'Cordón',
      categoryId: category!.id,
      condition: 'new'
    }
    const response = await createProduct(api, productBody, body.accessToken);
    expect(response.status).toBe(201);
    const product = await Product.findByPk(response.body.product.id);
    expect(response.body.product).toMatchObject({
      activeOffer: false,
      views: 0,
      id: product!.id,
      name: productBody.name,
      price: product!.price,
      priceInUyu: product!.priceInUyu,
      currency: productBody.currency,
      stock: productBody.stock,
      location: productBody.location,
      condition: productBody.condition
    });
    expect(response.body.photos).toHaveLength(5);
  }, 20000);

  it('can get all products', async () => {
    const response = await api
      .get('/api/products');
    expect(response.status).toBe(200);
    expect(response.body.products).toHaveLength(1);
    expect(response.body.totalProducts).toBe(1);
    expect(response.body.totalPages).toBe(1);
    expect(response.body.currentPage).toBe(1);
  });

  it('can get individual products', async () => {
    const product = await Product.findOne({ where: { name: "PlayStation 5" } });
    const response = await api
      .get(`/api/products/${product!.id}`);
    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      id: product!.id,
      sellerId: product!.sellerId,
      name: product!.name,
      price: product!.price,
      priceInUyu: product!.priceInUyu,
      currency: product!.currency,
      condition: product!.condition,
      stock: product!.stock,
      location: product!.location,
      categoryId: product!.categoryId
    });
  });
})