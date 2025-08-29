import express from 'express';
import { PORT } from './utils/config';
import { initializeDB } from './utils/db';
const app = express();

app.listen(PORT, async () => {
    try {
        await initializeDB();
    }
    catch(error) {
        console.log(error);
    }
    console.log(`Listening to PORT: ${PORT}`);
})