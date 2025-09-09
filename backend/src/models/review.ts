import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../utils/db';
import { User, Seller } from './index';

class Review extends Model{
  declare id: number;
  declare userId: number;
  declare sellerId: number;
  declare comment: string;
  declare rating: number;
}

Review.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: User,
        key: 'id'
      }
    },
    sellerId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Seller,
        key: 'id'
      }
    },
    comment: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    rating: {
      type: DataTypes.DECIMAL(2, 1),
      allowNull: false
    }
  },
  {
    sequelize,
    modelName: 'review',
    underscored: true
  }
)

export default Review;