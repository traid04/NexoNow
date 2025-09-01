require('dotenv').config();

const PORT : string | undefined = process.env.PORT;
const DB_URI : string | undefined = process.env.DB_URI;
const JWT_TOP_SECRET_KEY : string | undefined = process.env.JWT_TOP_SECRET_KEY;
const EMAIL_USER : string | undefined = process.env.EMAIL_USER;
const EMAIL_PASS : string | undefined = process.env.EMAIL_PASS;
const PAGE_URL : string | undefined = process.env.PAGE_URL
export { PORT, DB_URI, JWT_TOP_SECRET_KEY, EMAIL_USER, EMAIL_PASS, PAGE_URL };