require('dotenv').config();

const PORT : string | undefined = process.env.PORT;
const DB_URI : string | undefined = process.env.DB_URI;
export { PORT, DB_URI };