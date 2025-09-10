import { DataTypes, Model } from "sequelize";
import { Product } from "./index";
import { sequelize } from "../utils/db";

class ProductPhoto extends Model {
    declare id: number;
    declare productId: number;
    declare photoId: string;
    declare url: string;
}

ProductPhoto.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    productId: {
      type: DataTypes.INTEGER,
      references: {
        model: Product,
        key: "id"
      }
    },
    photoId: {
      type: DataTypes.STRING,
      allowNull: false
    },
    url: {
      type: DataTypes.STRING,
      allowNull: false
    }
  },
  {
    sequelize,
    modelName: 'product_photo',
    underscored: true,
    timestamps: false
  }
)

export default ProductPhoto;