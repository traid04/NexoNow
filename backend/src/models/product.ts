import { DataTypes, Model } from "sequelize";
import { sequelize } from "../utils/db";
import { Category, Seller } from "./index";

class Product extends Model {
  declare id: number;
  declare sellerId: number;
  declare name: string;
  declare price: number;
  declare priceInUyu: number;
  declare currency: string;
  declare activeOffer: boolean;
  declare offerPriceInUyu: number;
  declare offerPrice: number;
  declare startOfferDate: string;
  declare endOfferDate: string;
  declare description: string;
  declare stock: number;
  declare location: string;
  declare categoryId: number;
  declare condition: string;
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
    priceInUyu: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: {
        min: 0,
      }
    },
    currency: {
      type: DataTypes.ENUM('UYU', 'USD'),
      allowNull: false
    },
    activeOffer: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    offerPrice: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      validate: {
        min: 0
      }
    },
    offerPriceInUyu: {
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
    condition: {
      type: DataTypes.ENUM('new', 'used', 'refurbished'),
      allowNull: false
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
    views: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    }
  },
  {
    sequelize,
    modelName: "product",
    underscored: true,
  }
);

export default Product;
