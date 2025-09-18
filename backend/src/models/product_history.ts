import { sequelize } from "../utils/db";
import { DataTypes, Model } from "sequelize";
import { Product, User } from './index'

class ProductHistory extends Model{
  declare id: number;
  declare productId: number;
  declare userId: number;
}

ProductHistory.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    productId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Product,
        key: "id"
      }
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: User,
        key: "id"
      }
    }
  },
  {
    sequelize,
    modelName: "product_history",
    freezeTableName: true,
    underscored: true
  }
)

export default ProductHistory;