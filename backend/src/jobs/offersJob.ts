import cron from 'node-cron';
import { Product } from '../models/index';
import { Op } from 'sequelize';

export const updateOffers =  () => {
  cron.schedule('* * * * *', async () => {
    try {
      const [activatedCount] = await Product.update({ activeOffer: true }, {
        where: {
          activeOffer: false,
          startOfferDate: {
            [Op.lte]: new Date()
          },
          endOfferDate: {
            [Op.gte]: new Date()
          }
        }
      });
      console.log(`${activatedCount} activated offers`);
      const [deactivatedCount] = await Product.update({ activeOffer: false }, {
        where: {
          activeOffer: true,
          endOfferDate: {
            [Op.lt]: new Date()
          }
        }
      });
      console.log(`${deactivatedCount} deactivated offers`);
    }
    catch(error) {
      console.log('Error updating offers: ', error);
    }
  });
}