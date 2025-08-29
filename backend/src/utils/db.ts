import { DB_URI } from '../utils/config';
import { Sequelize } from 'sequelize';

if (!DB_URI) {
    throw new Error('Undefined Database');
}

export const sequelize = new Sequelize(DB_URI);

export const initializeDB = async () => {
    try {
        await sequelize.authenticate();
        console.log('Connection has been established succesfully');
    }
    catch(error: unknown) {
        if (error instanceof Error) {
            console.log('Error: ', error.message);
        }
        else {
            console.log('Unknown error: ', error);
        }
    }
}