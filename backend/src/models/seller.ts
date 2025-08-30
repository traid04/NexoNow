import { DataTypes, Model } from "sequelize";
import { sequelize } from "../utils/db";
import { User } from "./index";

class Seller extends Model {
  public id!: number;
  public userId!: number;
  public department!: string;
  public city!: string;
  public address!: string;
  public floorOrApartment!: string;
  public phoneNumber!: string;
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
