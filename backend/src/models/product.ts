import { DataTypes, Model } from "sequelize";
import { sequelize } from "../utils/db";
import { Seller } from "./index";

class Product extends Model {
  public id!: number;
  public sellerId!: number;
  public name!: string;
  public price!: string;
  public offerPrice!: number;
  public startOfferDate!: Date;
  public endOfferDate!: Date;
  public description!: string;
  public images!: string[];
  public stock!: number;
  public location!: string;
  public category!: string;
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
    offerPrice: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      validate: {
        min: 0
      }
    },
    startOfferDate: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    endOfferDate: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    images: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      allowNull: false,
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
    category: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: "product",
    underscored: true,
  }
);

export default Product;
