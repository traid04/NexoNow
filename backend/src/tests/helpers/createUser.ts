import path from 'path';
import { NewUserEntry } from '../../types/types';
import TestAgent from 'supertest/lib/agent';
import Test from 'supertest/lib/test';

export const photoPath = path.resolve(__dirname, "../../../../media/feb0b18c-8c36-44ed-bbd1-bed570735831.png");

export const createUser = async (api: TestAgent<Test>, user: NewUserEntry) => {
  const response = await api
    .post('/api/users')
    .field("username", user.username)
    .field("firstName", user.firstName)
    .field("lastName", user.lastName)
    .field("email", user.email)
    .field("birthDate", user.birthDate)
    .field("password", user.password)
    .attach("avatarPhoto", photoPath);
  return response
};