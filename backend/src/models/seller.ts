import { DataTypes, Model } from "sequelize";
import { sequelize } from "../utils/db";
import { User } from "./index";

class Seller extends Model {
  declare id: number;
  declare userId: number;
  declare department: string;
  declare city: string;
  declare address: string;
  declare floorOrApartment: string;
  declare phoneNumber: string;
}

Seller.init(
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
        key: "id",
      },
    },
    department: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    city: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    address: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    floorOrApartment: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    phoneNumber: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: "seller",
    underscored: true,
  }
);

export default Seller;
