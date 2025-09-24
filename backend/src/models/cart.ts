import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../utils/db';
import { Product, User } from './index';

class Cart extends Model {
  declare id: number;
  declare userId: number;
  declare productId: number;
}

Cart.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: User,
        key: "id"
      }
    },
    productId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Product,
        key: "id"
      }
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1
    }
  },
  {
    sequelize,
    modelName: "cart",
    underscored: true
  }
)

export default Cart;