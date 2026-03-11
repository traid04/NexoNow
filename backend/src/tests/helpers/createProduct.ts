import path from 'path';
import TestAgent from 'supertest/lib/agent';
import Test from 'supertest/lib/test';

const photoPath1 = path.resolve(__dirname, "../../../../media/product_test/24K-Gold-PS5-PlayStation-5-DualShock-Wireless-Controller-and-Headset-Bundle-on-sale-at-PlayStation-Store-Direct.com_.png");
const photoPath2 = path.resolve(__dirname, "../../../../media/product_test/375_375.jpeg");
const photoPath3 = path.resolve(__dirname, "../../../../media/product_test/descarga.jpg");
const photoPath4 = path.resolve(__dirname, "../../../../media/product_test/joystick-inalambrico-sony-playstation-5-dualsense-ps5-azul-joystick-inalambrico-sony-playstation-5-dualsense-ps5-azul.jpg");
const photoPath5 = path.resolve(__dirname, "../../../../media/product_test/PS5-Slim-Bluray-web.png");
const photos = [photoPath1, photoPath2, photoPath3, photoPath4, photoPath5];

type CreateProductEntry = {
  name: string;
  price: number;
  currency: string;
  stock: number;
  location: string;
  categoryId: number;
  condition: string;
  description?: string;
}

export const createProduct = async (api: TestAgent<Test>, productBody: CreateProductEntry, token: string) => {
  const request = api
    .post('/api/products')
    .set('Authorization', `Bearer ${token}`)
    .field('name', productBody.name)
    .field('price', productBody.price)
    .field('currency', productBody.currency)
    .field('stock', productBody.stock)
    .field('location', productBody.location)
    .field('categoryId', productBody.categoryId)
    .field('condition', productBody.condition)
  photos.forEach(p => request.attach('photos', p));
  const response = await request;
  return response;
}