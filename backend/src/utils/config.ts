require('dotenv').config();

const PORT : string | undefined = process.env.PORT;
const DB_URI : string | undefined = process.env.DB_URI;
const JWT_TOP_SECRET_KEY : string | undefined = process.env.JWT_TOP_SECRET_KEY;
const EMAIL_USER : string | undefined = process.env.EMAIL_USER;
const EMAIL_PASS : string | undefined = process.env.EMAIL_PASS;
const PAGE_URL : string | undefined = process.env.PAGE_URL
const COOKIE_TOP_SECRET_KEY: string | undefined = process.env.COOKIE_TOP_SECRET_KEY;
const CLOUDINARY_CLOUD_NAME: string | undefined = process.env.CLOUDINARY_CLOUD_NAME;
const CLOUDINARY_API_KEY: string | undefined = process.env.CLOUDINARY_API_KEY;
const CLOUDINARY_API_SECRET: string | undefined = process.env.CLOUDINARY_API_SECRET;
export { PORT, DB_URI, JWT_TOP_SECRET_KEY, EMAIL_USER, EMAIL_PASS, PAGE_URL, COOKIE_TOP_SECRET_KEY, CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET };