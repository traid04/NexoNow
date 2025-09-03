import { DB_URI } from '../utils/config';
import { Sequelize } from 'sequelize';
import { Umzug, SequelizeStorage } from 'umzug';

if (!DB_URI) {
  throw new Error('Undefined Database');
}

export const sequelize : Sequelize = new Sequelize(DB_URI);

const umzug = new Umzug({
  migrations: { glob: './src/migrations/*.js' },
  context: sequelize.getQueryInterface(),
  storage: new SequelizeStorage({ sequelize, tableName: 'migrations' }),
  logger: console
})

export const initializeDB = async () => {
  try {
    await sequelize.authenticate();
    console.log('Connection has been established succesfully');
    await umzug.up();
    console.log('All migrations applied');
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

export const rollbackMigrations = async () => {
  await sequelize.authenticate();
  await umzug.down({ to: 0 });
  await sequelize.close();
}