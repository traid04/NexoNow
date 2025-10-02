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
  const normalUserBody = {
    username: "normalUser",
    firstName: "testing",
    lastName: "user random",
    email: "normalUserTest@yopmail.com",
    birthDate: "10-01-2025",
    password: "normalUser"
  };
  await createUser(api, normalUserBody);
  const normalUser = await User.findOne({ where: { email: normalUserBody.email } });
  normalUser!.isVerified = true;
  await normalUser!.save();
  await Seller.create({
    userId: normalUser!.id,
    department: "Second User Department",
    city: "Second User City",
    address: "Second User Address"
  });
  const firstSeller = await Seller.findOne({ where: { userId: firstUser!.id } });
  await Review.create({ userId: normalUser!.dataValues.id, sellerId: firstSeller!.id, rating: 4, comment: "Nice products" });
  const secondNormalUserBody = {
    username: "secondNormalUser",
    firstName: "testing",
    lastName: "user random",
    email: "secondNormalUserTest@yopmail.com",
    birthDate: "10-01-2025",
    password: "secondNormalUser"
  };
  await createUser(api, secondNormalUserBody);
  const secondNormalUser = await User.findOne({ where: { email: secondNormalUserBody.email } });
  secondNormalUser!.isVerified = true;
  await secondNormalUser!.save();
  const thirdNormalUserBody = {
    username: "thirdNormalUser",
    firstName: "testing",
    lastName: "third use",
    email: "thirdNormalUserTest@yopmail.com",
    birthDate: "10-01-2025",
    password: "thirdNormalUser"
  };
  await createUser(api, thirdNormalUserBody);
  const thirdNormalUser = await User.findOne({ where: { email: thirdNormalUserBody.email } });
  thirdNormalUser!.isVerified = true;
  await thirdNormalUser!.save();
  await Review.create({ userId: thirdNormalUser!.dataValues.id, sellerId: firstSeller!.id, rating: 4, comment: "Nice products" });
}, 25000);

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

describe('User', () => {
  it('can get all reviews', async () => {
    const response = await api
      .get('/api/reviews');
    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(2);
  });

  it('can get individual reviews', async () => {
    const user = await User.findOne({ where: { email: "normalUserTest@yopmail.com" } });
    const seller = await Seller.findOne({ where: { address: "First User Address" } });
    const review = await Review.findOne({ where: { comment: "Nice products" } });
    const response = await api
      .get(`/api/reviews/${review!.id}`);
    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      id: response.body.id,
      user: {
        id: user!.id,
        avatarPhoto:
        user!.avatarPhoto,
        username: user!.username,
        email: user!.email
      },
      seller: {
        id: seller!.id
      },
      rating: "4.0",
      comment: "Nice products" });
  });

  it('cannot get individual reviews with invalid ids', async () => {
    const response = await api
      .get('/api/reviews/invalidID');
    expect(response.status).toBe(400);
    expect(response.body).toEqual({ error: 'ID must be a number' });
  });

  it('cannot update his reviews without being logged in', async () => {
    const review = await Review.findOne({ where: { comment: "Nice products" } });
    const response = await api
      .patch(`/api/reviews/${review!.id}`)
      .send({ rating: 4.5, comment: "Testing comment update" });
    expect(response.status).toBe(401);
    expect(response.body).toEqual({ error: "Token missing or invalid" });
  });

  it ('cannot update another user reviews', async () => {
    const review = await Review.findOne({ where: { comment: "Nice products" } });
    const { body } = await loginUser(api, "firstAccountInDB@yopmail.com", "firsttest");
    expect(body.accessToken).toBeDefined();
    const response = await api
      .patch(`/api/reviews/${review!.id}`)
      .set('Authorization', `Bearer ${body.accessToken}`)
      .send({ rating: 4.5, comment: "Testing comment update" });
    expect(response.status).toBe(401);
    expect(response.body).toEqual({ error: "Cannot update another user's review" });
  })

  it('cannot update non-existent review', async () => {
    const { body } = await loginUser(api, "firstAccountInDB@yopmail.com", "firsttest");
    expect(body.accessToken).toBeDefined();
    const response = await api
      .patch('/api/reviews/0')
      .set('Authorization', `Bearer ${body.accessToken}`)
      .send({ rating: 4.5, comment: "Testing comment update" });
    expect(response.status).toBe(404);
    expect(response.body).toEqual({ error: "Review not found" });
  });

  it ('cannot update with invalid rating value', async () => {
    const review = await Review.findOne({ where: { comment: "Nice products" } });
    const { body } = await loginUser(api, "normalUserTest@yopmail.com", "normalUser");
    expect(body.accessToken).toBeDefined();
    const response = await api
      .patch(`/api/reviews/${review!.id}`)
      .set('Authorization', `Bearer ${body.accessToken}`)
      .send({ rating: 5.1, comment: "Testing comment update" });
    expect(response.status).toBe(400);
    expect(response.body).toEqual({ error: "Rating must be between 1 and 5" });
    const response2 = await api
      .patch(`/api/reviews/${review!.id}`)
      .set('Authorization', `Bearer ${body.accessToken}`)
      .send({ rating: 0.9, comment: "Testing comment update" });
    expect(response2.status).toBe(400);
    expect(response2.body).toEqual({ error: "Rating must be between 1 and 5" });
  });

  it('can update his reviews', async () => {
    const user = await User.findOne({ where: { email: "normalUserTest@yopmail.com" } });
    const seller = await Seller.findOne({ where: { address: "First User Address" } });
    const review = await Review.findOne({ where: { comment: "Nice products" } });
    const { body } = await loginUser(api, "normalUserTest@yopmail.com", "normalUser");
    expect(body.accessToken).toBeDefined();
    const response = await api
      .patch(`/api/reviews/${review!.id}`)
      .set('Authorization', `Bearer ${body.accessToken}`)
      .send({ rating: 4.5, comment: "Testing comment update" });
    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      id: review!.id,
      userId: user!.id,
      sellerId: seller!.id,
      comment: 'Testing comment update',
      rating: 4.5
    });
  });

  it('can get seller reviews', async () => {
    const seller = await Seller.findOne({ where: { address: "First User Address" } });
    const response = await api
      .get(`/api/sellers/${seller!.id}/reviews`);
    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(2);
  });

  it('cannot get not-existent seller reviews', async () => {
    const response = await api
      .get('/api/sellers/0/reviews');
    expect(response.status).toBe(404);
    expect(response.body).toEqual({ error: "Seller not found" });
  });

  it('cannot delete reviews without being logged in', async () => {
    const review = await Review.findOne({ where: { comment: "Testing comment update" } });
    const response = await api
      .delete(`/api/reviews/${review!.id}`);
    expect(response.status).toBe(401);
    expect(response.body).toEqual({ error: 'Token missing or invalid' });
  });

  it('can delete his own reviews', async () => {
    const review = await Review.findOne({ where: { comment: "Testing comment update" } });
    const { body } = await loginUser(api, "normalUserTest@yopmail.com", "normalUser");
    expect(body.accessToken).toBeDefined();
    const response = await api
      .delete(`/api/reviews/${review!.id}`)
      .set('Authorization', `Bearer ${body.accessToken}`);
    expect(response.status).toBe(204);
    expect(response.body).toEqual({ });
  });

  it('can create reviews', async () => {
    const user = await User.findOne({ where: { email: "normalUserTest@yopmail.com" } });
    const seller = await Seller.findOne({ where: { address: "First User Address" } });
    const { body } = await loginUser(api, "normalUserTest@yopmail.com", "normalUser");
    expect(body.accessToken).toBeDefined();
    const response = await api
      .post(`/api/sellers/${seller!.id}/reviews`)
      .set('Authorization', `Bearer ${body.accessToken}`)
      .send({ comment: "Bad attention", rating: 2.5 });
    expect(response.status).toBe(201);
    const review = await Review.findOne({ where: { comment: "Bad attention" } });
    expect(response.body).toMatchObject({
      id: review!.id,
      userId: user!.id,
      sellerId: seller!.id,
      comment: 'Bad attention',
      rating: '2.5',
      user: {
        id: user!.id,
        username: user!.username,
        avatarPhoto: user!.avatarPhoto
      }
    })
  });

  it("cannot delete another user's review", async () => {
    const review = await Review.findOne({ where: { comment: "Bad attention" } });
    const { body } = await loginUser(api, "firstAccountInDB@yopmail.com", "firsttest");
    expect(body.accessToken).toBeDefined();
    const response = await api
      .delete(`/api/reviews/${review!.id}`)
      .set('Authorization', `Bearer ${body.accessToken}`);
    expect(response.status).toBe(401);
    expect(response.body).toEqual({ error: "Cannot delete another user's review" })
  });

  it("cannot delete non-existent review", async () => {
    const { body } = await loginUser(api, "normalUserTest@yopmail.com", "normalUser");
    expect(body.accessToken).toBeDefined();
    const response = await api
      .delete('/api/reviews/0')
      .set('Authorization', `Bearer ${body.accessToken}`);
    expect(response.status).toBe(404);
    expect(response.body).toEqual({ error: "Review not found" });
  });

  it('cannot create reviews without being logged in', async () => {
    const seller = await Seller.findOne({ where: { address: "First User Address" } });
    const response = await api
      .post(`/api/sellers/${seller!.id}/reviews`)
      .send({ comment: "Bad attention", rating: 2.5 });
    expect(response.status).toBe(401);
    expect(response.body).toEqual({ error: "Token missing or invalid" });
  });

  it('cannot create reviews to a already reviewed user', async () => {
    const seller = await Seller.findOne({ where: { address: "First User Address" } });
    const { body } = await loginUser(api, "normalUserTest@yopmail.com", "normalUser");
    expect(body.accessToken).toBeDefined();
    const response = await api
      .post(`/api/sellers/${seller!.id}/reviews`)
      .set('Authorization', `Bearer ${body.accessToken}`)
      .send({ comment: "Nice products", rating: 5 });
    expect(response.status).toBe(409);
    expect(response.body).toEqual({ error: 'User has already reviewed this seller' })
  });

  it('cannot create reviews with invalid rating value', async () => {
    const seller = await Seller.findOne({ where: { address: "First User Address" } });
    const { body } = await loginUser(api, "secondNormalUserTest@yopmail.com", "secondNormalUser");
    expect(body.accessToken).toBeDefined();
    const response = await api
      .post(`/api/sellers/${seller!.id}/reviews`)
      .set('Authorization', `Bearer ${body.accessToken}`)
      .send({ comment: "Nice attention", rating: 5.1 });
    expect(response.status).toBe(400);
    expect(response.body).toEqual({ error: 'Rating must be between 1 and 5' });
    const response2 = await api
      .post(`/api/sellers/${seller!.id}/reviews`)
      .set('Authorization', `Bearer ${body.accessToken}`)
      .send({ comment: "Bad attention", rating: 0.9 });
    expect(response2.status).toBe(400);
    expect(response2.body).toEqual({ error: 'Rating must be between 1 and 5' });
  });

  it('can get sellers average rating', async () => {
    const seller = await Seller.findOne({ where: { address: "First User Address" } });
    const response = await api
      .get(`/api/sellers/${seller!.id}/reviews/averageRating`);
    expect(response.status).toBe(200);
    expect(response.body).toEqual({ averageRating: 3.25 });
  });

  it('cannot get non-existent seller average rating', async () => {
    const response = await api
      .get('/api/sellers/0/reviews/averageRating');
    expect(response.status).toBe(404);
    expect(response.body).toEqual({ error: "Seller not found" });
  })

  it('cannot get average rating of a seller without reviews', async () => {
    const seller = await Seller.findOne({ where: { address: 'Second User Address' } });
    const response = await api
      .get(`/api/sellers/${seller!.id}/reviews/averageRating`);
      console.log(response.body);
    expect(response.status).toBe(200);
    expect(response.body).toEqual({ averageRating: 0 });
  });
});