import supertest from 'supertest';
import { app } from '../index';
import { sequelize } from '../utils/db';
import { Review, Seller, User } from '../models/index';
import { createUser } from './helpers/createUser';
import { loginUser } from './helpers/loginUser';
import { deletePhoto } from '../services/imagesService';

const api = supertest(app);

beforeAll(async () => {
  await sequelize.authenticate();
  const firstUserBody = {
    username: "initialDBAccount",
    firstName: "first",
    lastName: "acc",
    email: "firstAccountInDB@yopmail.com",
    birthDate: "09-30-2025",
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
  const userWithoutSellerBody = {
    username: "AccountWithoutUser",
    firstName: "second",
    lastName: "acc",
    email: "sellernull@yopmail.com",
    birthDate: "09-30-2025",
    password: "secondtest"
  };
  await createUser(api, userWithoutSellerBody);
  const secondUser = await User.findOne({ where: { username: userWithoutSellerBody.username } });
  secondUser!.isVerified = true;
  await secondUser!.save();
}, 15000);

afterAll(async () => {
  await Seller.destroy({ where: { } });
  const users = await User.findAll();
  await User.destroy({ where: { } });
  for (const u of users) {
    await deletePhoto(u.avatarId);
  }
  await Review.destroy({ where: { } });
  await sequelize.close();
});

describe('Seller', () => {
  it('get is working', async () => {
    const response = await api
      .get('/api/sellers');
    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(1);
  });

  it('individual get is working', async () => {
    const sellerToGet = await Seller.findOne({ where: { address: "First User Address" } });
    const response = await api
      .get(`/api/sellers/${sellerToGet!.id}`);
    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      id: sellerToGet!.id,
      department: sellerToGet!.department,
      city: sellerToGet!.city,
      address: sellerToGet!.address,
      floorOrApartment: null,
      phoneNumber: null
    });
  });

  it('can be created by user', async () => {
    const { body } = await loginUser(api, "sellernull@yopmail.com", "secondtest");
    expect(body).toHaveProperty("accessToken");
    const sellerBody = {
      department: "Montevideo",
      city: "Montevideo",
      address: "Random Address 123",
      phoneNumber: "+598 91 134 238"
    }
    const response = await api
      .post('/api/sellers')
      .set('Authorization', `Bearer ${body.accessToken}`)
      .send(sellerBody);
    expect(response.status).toBe(201);
    const seller = await Seller.findOne({ where: { address: sellerBody.address, phoneNumber: sellerBody.phoneNumber } });
    expect(response.body).toMatchObject({
      id: seller!.id,
      userId: seller!.userId,
      department: sellerBody.department,
      city: sellerBody.city,
      address: sellerBody.address,
      phoneNumber: sellerBody.phoneNumber,
      floorOrApartment: null
    });
  });

  it('cannot be created if the user is logged out', async () => {
    const sellerBody = {
      department: "Montevideo",
      city: "Montevideo",
      address: "address 224",
      phoneNumber: "+598 12 345 678"
    }
    const response = await api
      .post('/api/sellers')
      .send(sellerBody);
    expect(response.status).toBe(401);
    expect(response.body).toEqual({ error: 'Token missing or invalid' });
  });

  it('cannot be updated if the user is logged out', async () => {
    const sellerUpdateBody = {
      phoneNumber: "+598 92 123 456"
    }
    const response = await api
      .post('/api/sellers')
      .send(sellerUpdateBody);
    expect(response.status).toBe(401);
    expect(response.body).toEqual({ error: 'Token missing or invalid' });
  });

  it('can be updated by user', async () => {
    const { body } = await loginUser(api, "sellernull@yopmail.com", "secondtest");
    expect(body).toHaveProperty("accessToken");
    const seller = await Seller.findOne({ where: { phoneNumber: "+598 91 134 238" } });
    const sellerUpdateBody = {
      address: "Updated address",
      phoneNumber: "+598 92 123 456"
    }
    const response = await api
      .patch(`/api/sellers/${seller!.id}`)
      .set('Authorization', `Bearer ${body.accessToken}`)
      .send(sellerUpdateBody);
    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      id: seller!.id,
      userId: seller!.userId,
      department: seller!.department,
      city: seller!.city,
      address: sellerUpdateBody.address,
      floorOrApartment: null,
      phoneNumber: sellerUpdateBody.phoneNumber
    });
  });

  it('cannot be deleted if the user is being logged out', async () => {
    const sellerToDelete = await Seller.findOne({ where: { address: "First User Address" } });
    const response = await api
      .delete(`/api/sellers/${sellerToDelete!.id}`)
    expect(response.status).toBe(401);
    expect(response.body).toEqual({ error: 'Token missing or invalid' });
  });

  it ('can be deleted by user', async () => {
    const { body } = await loginUser(api, "firstAccountInDB@yopmail.com", "firsttest");
    expect(body).toHaveProperty("accessToken");
    const sellerToDelete = await Seller.findOne({ where: { address: "First User Address" } });
    const response = await api
      .delete(`/api/sellers/${sellerToDelete!.id}`)
      .set('Authorization', `Bearer ${body.accessToken}`);
    expect(response.status).toBe(204);
    expect(response.body).toEqual({});
  });
});