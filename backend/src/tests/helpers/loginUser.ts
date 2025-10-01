import TestAgent from 'supertest/lib/agent';
import Test from 'supertest/lib/test';

export const loginUser = async (api: TestAgent<Test>, email: string, password: string) => {
  const response = await api
    .post('/api/login')
    .send({ email, password });
  return response;
};