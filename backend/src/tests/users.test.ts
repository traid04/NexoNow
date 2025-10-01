import supertest from 'supertest';
import Test from 'supertest/lib/test';
import TestAgent from 'supertest/lib/agent';
import { app } from '../index';
import { sequelize } from '../utils/db';
import { User } from '../models/index';
import { deletePhoto } from '../services/imagesService';
import { createUser, photoPath } from './helpers/createUser';
import { loginUser } from './helpers/loginUser';

const api: TestAgent<Test> = supertest(app);

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
  const secondUserBody = {
    username: "secondDBAccount",
    firstName: "first",
    lastName: "acc",
    email: "secondAccountInDB@yopmail.com",
    birthDate: "09-30-2025",
    password: "secondtest"
  };
  await createUser(api, secondUserBody);
  const secondUser = await User.findOne({ where: { username: secondUserBody.username } });
  secondUser!.isVerified = true;
  await secondUser!.save();
}, 15000);

afterAll(async () => {
  const users = await User.findAll();
  await User.destroy({
    where: {
      email: ["firstAccountInDB@yopmail.com", "testAcc@yopmail.com", "secondAccountInDB@yopmail.com"]
    }
  });
  for (const u of users) {
    await deletePhoto(u.avatarId);
  }
  await sequelize.close();
})

describe('User', () => {
  it('can get profiles', async () => {
    const users = await api
      .get('/api/users')
    expect(users.status).toBe(200);
    expect(users.body).toHaveLength(2);
  });

  it('can get another user by id', async () => {
    const userToGet = await User.findOne();
    const response = await api
      .get(`/api/users/${userToGet!.id}`);
    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      id: Number(userToGet!.id),
      username: userToGet!.username,
      firstName: userToGet!.firstName,
      lastName: userToGet!.lastName,
      birthDate: userToGet!.birthDate,
      email: userToGet!.email,
      seller: userToGet!.seller === undefined ? null : userToGet!.seller
    });
  });

  it('cannot get another user with invalid id', async () => {
    const response = await api
      .get('/api/users/invalidIdOnlyNumbersAllowed');
    expect(response.status).toBe(400);
    expect(response.body).toEqual({ error: 'ID must be a number' });
  })

  it("cannot get a user that doesn't exist", async () => {
    const response = await api
      .get('/api/users/0');
    expect(response.status).toBe(404);
    expect(response.body).toEqual({ error: "User not found" });
  })
  
  it('can create profile', async () => {
    const newUserBody = {
      username: "testAccount",
      firstName: "new",
      lastName: "test",
      email: "testAcc@yopmail.com",
      birthDate: "09-30-2025",
      password: "testingCreateNewAccount"
    };
    const response = await createUser(api, newUserBody);
    expect(response.status).toBe(201);
    expect(response.body).toMatchObject({ username: "testAccount", firstName: "new", lastName: "test", birthDate: "09-30-2025" });
    expect(response.body).toHaveProperty("avatarPhoto");
  }, 10000);

  it('cannot register with duplicate email', async () => {
    const newUserBody = {
      username: "UniqueUsername",
      firstName: "UniqueFirstName",
      lastName: "UniqueLastName",
      email: "testAcc@yopmail.com",
      birthDate: "09-30-2025",
      password: "randomPass"
    };
    const response = await createUser(api, newUserBody);
    expect(response.status).toBe(400);
    expect(response.body).toEqual({ error: ['email must be unique'] });
  });

  it('cannot register with duplicate username', async () => {
    const newUserBody = {
      username: "testAccount",
      firstName: "UniqueFirstName",
      lastName: "UniqueLastName",
      email: "UniqueEmail@yopmail.com",
      birthDate: "09-30-2025",
      password: "randomPass"
    };
    const response = await createUser(api, newUserBody);
    expect(response.status).toBe(400);
    expect(response.body).toEqual({ error: ['username must be unique'] });
  });

  it('cannot register with invalid email', async () => {
    const newUserBody = {
      username: "UniqueUsername",
      firstName: "UniqueFirstName",
      lastName: "UniqueLastName",
      email: "invalidEmail@.com",
      birthDate: "09-30-2025",
      password: "randomPass"
    };
    const response = await createUser(api, newUserBody);
    expect(response.status).toBe(400);
    expect(response.body).toEqual({ error: ['email is invalid'] });
  });

  it('cannot register if password length < 8', async () => {
    const newUserBody = {
      username: "UniqueUsername",
      firstName: "UniqueFirstName",
      lastName: "UniqueLastName",
      email: "validEmail@gmail.com",
      birthDate: "09-30-2025",
      password: "1234"
    };
    const response = await createUser(api, newUserBody);
    expect(response.status).toBe(400);
    expect(response.body).toEqual({ error: "The password must be at least 8 characters" });
  });

  it('cannot register without uploading profile avatar', async () => {
    const { username, firstName, lastName, email, birthDate, password } = {
      username: "UniqueUsername",
      firstName: "UniqueFirstName",
      lastName: "UniqueLastName",
      email: "validEmail@gmail.com",
      birthDate: "09-30-2025",
      password: "12345678910"
    };
    const response = await api
      .post('/api/users')
      .field("username", username)
      .field("firstName", firstName)
      .field("lastName", lastName)
      .field("email", email)
      .field("birthDate", birthDate)
      .field("password", password);
    expect(response.status).toBe(400);
    expect(response.body).toEqual({ error: "The profile picture is required" });
  });

  it('cannot update profile without being logged in', async () => {
    const response = await api
      .patch('/api/users/me')
      .send({ firstName: "testing patch", lastName: "new last name" });
    expect(response.status).toBe(401);
    expect(response.body).toEqual({ error: "Token missing or invalid" });
  });

  it('can update successfully his profile', async () => {
    const { body } = await loginUser(api, "firstAccountInDB@yopmail.com", "firsttest");
    expect(body).toHaveProperty('accessToken');
    const newData = {
      firstName: "testing patch",
      lastName: "new last name"
    }
    const response = await api
      .patch('/api/users/me')
      .send(newData)
      .set('Authorization', `Bearer ${body.accessToken}`);
    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({ firstName: "testing patch", lastName: "new last name" });
  });

  it('can update successfully his profile avatar', async () => {
    const { body } = await loginUser(api, "firstAccountInDB@yopmail.com", "firsttest");
    expect(body).toHaveProperty('accessToken');
    const response = await api
      .patch('/api/users/me/change-avatar')
      .set('Authorization', `Bearer ${body.accessToken}`)
      .attach('avatarPhoto', photoPath);
    const newAvatar = await User.findOne({ where: { email: "firstAccountInDB@yopmail.com" }, attributes: ['avatarPhoto'] });
    expect(response.status).toBe(200);
    expect(response.body).toEqual({ message: 'Image updated successfully', newAvatar: newAvatar!.avatarPhoto });
  });

  it('cannot update profile avatar without uploading a photo', async () => {
    const { body } = await loginUser(api, "firstAccountInDB@yopmail.com", "firsttest");
    expect(body).toHaveProperty('accessToken');
    const response = await api
      .patch('/api/users/me/change-avatar')
      .set('Authorization', `Bearer ${body.accessToken}`);
    expect(response.status).toBe(400);
    expect(response.body).toEqual({ error: "New avatar photo required" });
  });

  it('can delete his own profile successfully', async () => {
    const { body } = await loginUser(api, "secondAccountInDB@yopmail.com", "secondtest");
    expect(body).toHaveProperty('accessToken');
    const response = await api
      .delete('/api/users/me')
      .set('Authorization', `Bearer ${body.accessToken}`);
    expect(response.status).toBe(204);
    expect(response.body).toEqual({});
    const deletedUser = await User.findOne({ where: { email: "secondAccountInDB@yopmail.com" } });
    expect(deletedUser).toBeNull();
  });

  it('can change his email', async () => {
    const { body } = await loginUser(api, "firstAccountInDB@yopmail.com", "firsttest");
    expect(body).toHaveProperty('accessToken');
    const response = await api
      .post('/api/users/me/change-email')
      .set('Authorization', `Bearer ${body.accessToken}`)
      .send({ email: "newemail@yopmail.com" });
    expect(response.status).toBe(200);
    expect(response.body).toEqual({ message: 'Update data email successfully sent' });
  });

  it('cannot change his email without being logged in', async () => {
    const response = await api
      .post('/api/users/me/change-email')
      .send({ email: "newemail@yopmail.com" });
    expect(response.status).toBe(401);
    expect(response.body).toEqual({ error: "Token missing or invalid" });
  });

  it('can change his password', async () => {
    const { body } = await loginUser(api, "firstAccountInDB@yopmail.com", "firsttest");
    expect(body).toHaveProperty('accessToken');
    const response = await api
      .post('/api/users/me/change-password')
      .set('Authorization', `Bearer ${body.accessToken}`)
      .send({ password: "newpassword" });
    expect(response.status).toBe(200);
    expect(response.body).toEqual({ message: 'Change Password mail successfully sent' });
  });

  it('cannot change his password without being logged in', async () => {
    const response = await api
      .post('/api/users/me/change-password')
      .send({ password: "newpassword" });
    expect(response.status).toBe(401);
    expect(response.body).toEqual({ error: "Token missing or invalid" });
  });

  it('cannot get his product history without being logged in', async () => {
    const response = await api
      .get('/api/users/me/product-history');
    expect(response.status).toBe(401);
    expect(response.body).toEqual({ error: "Token missing or invalid" });
  });
});