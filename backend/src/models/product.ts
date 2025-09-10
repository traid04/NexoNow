import { DataTypes, Model } from "sequelize";
import { sequelize } from "../utils/db";
import { Category, Seller } from "./index";

class Product extends Model {
  declare id: number;
  declare sellerId: number;
  declare name: string;
  declare price: number;
  declare offerPrice: number;
  declare startOfferDate: string;
  declare endOfferDate: string;
  declare description: string;
  declare stock: number;
  declare location: string;
  declare categoryId: number;
}

Product.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    sellerId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Seller,
        key: "id",
      },
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: {
        min: 0,
      },
    },
    currency: {
      type: DataTypes.STRING,
      allowNull: false
    },
    offerPrice: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      validate: {
        min: 0
      }
    },
    startOfferDate: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    endOfferDate: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    stock: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 0,
      },
    },
    location: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    categoryId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Category,
        key: "id"
      }
    },
  },
  {
    sequelize,
    modelName: "product",
    underscored: true,
  }
);

export default Product;
