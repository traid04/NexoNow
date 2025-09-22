import { DataTypes, Model } from "sequelize";
import { sequelize } from "../utils/db";
import { Product, User } from "./index";

class Favorite extends Model {
  declare id: number;
  declare userId: number;
  declare productId: number;
  declare createdAt: Date;
  declare updatedAt: Date;
}

Favorite.init(
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
    }
  },
  {
    sequelize,
    modelName: "favorite",
    underscored: true
  }
)

export default Favorite;