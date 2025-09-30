import supertest from 'supertest';
import { app } from '../index';
import { sequelize } from '../utils/db';
import { User } from '../models/index';
import jsonwebtoken from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { JWT_TOP_SECRET_KEY } from '../utils/config';

const api = supertest(app);

beforeAll(async () => {
  await sequelize.authenticate();
  const passwordUser1 = await bcrypt.hash('correctPass', 10);
  await User.create({
    username: "testUser",
    firstName: "test",
    lastName: "user",
    birthDate: "10-08-2000",
    email: "supertest@gmail.com",
    passwordHash: passwordUser1
  });

  const passwordUser2 = await bcrypt.hash('verifiedPass', 10);

  await User.create({
    username: "verifiedUser",
    firstName: "super",
    lastName: "test",
    birthDate: "12-12-2012",
    email: "verifiedMail@hotmail.com",
    passwordHash: passwordUser2,
    isVerified: true
  });
}, 15000)

afterAll(async () => {
  await User.destroy({
    where: {
      email: ["supertest@gmail.com", "verifiedMail@hotmail.com"]
    }
  });
  await sequelize.close();
});

describe('User', () => {
  it("cannot log in with invalid email", async () => {
    const res = await api
      .post(`/api/login`)
      .send({ email: "incorrectEmail@gmail.com", password: "RandomPass" });
    expect(res.status).toBe(404);
    expect(res.body).toEqual({ error: 'User with email incorrectEmail@gmail.com not found' });
  });

  it ("cannot log in with invalid password", async () => {
    const res = await api
      .post(`/api/login`)
      .send({ email: "verifiedMail@hotmail.com", password: "incorrectPass" });
    expect(res.status).toBe(401);
    expect(res.body).toEqual({ error: "Incorrect password" });
  });

  it ("cannot log in with unverified account", async () => {
    const res = await api
      .post(`/api/login`)
      .send({ email: "supertest@gmail.com", password: "correctPass" });
    expect(res.status).toBe(401);
    expect(res.body).toEqual({ error: "You must have your account verified for log in" });
  });

  it ("log in successfully", async () => {
    const res = await api
      .post(`/api/login`)
      .send({ email: "verifiedMail@hotmail.com", password: "verifiedPass" });
    expect(res.status).toBe(200);
    const decodedToken = jsonwebtoken.verify(res.body.accessToken, JWT_TOP_SECRET_KEY!);
    const keys = ['userId', 'iat', 'exp'];
    for (const k of keys) {
      expect(decodedToken).toHaveProperty(k);
    }
    const properties = ["refreshToken=", "Path=/api/refresh;", "HttpOnly;", "Secure;", "SameSite=Strict"];
    for (const p of properties) {
      expect(res.headers['set-cookie'][0]).toMatch(p);
    }
  });
});