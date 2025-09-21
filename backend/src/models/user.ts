import { DataTypes, Model } from "sequelize";
import { sequelize } from "../utils/db";

class User extends Model {
  declare id: number;
  declare username: string;
  declare firstName: string;
  declare lastName: string;
  declare birthDate: string;
  declare email: string;
  declare passwordHash: string;
  declare isVerified: boolean;
  declare verifyToken: string;
  declare refreshToken: string;
  declare avatarPhoto: string;
  declare avatarId: string;
  declare mpAccessToken: string;
  declare mpRefreshToken: string;
  declare mpTokenExpiration: string;
  declare mpState: string;
}

User.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    avatarId: {
      type: DataTypes.STRING,
      allowNull: true
    },
    avatarPhoto: {
      type: DataTypes.STRING,
      allowNull: true
    },
    username: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    firstName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    lastName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    birthDate: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      },
    },
    isVerified: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    verifyToken: {
      type: DataTypes.STRING,
      allowNull: true
    },
    passwordHash: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    refreshToken: {
      type: DataTypes.STRING,
      allowNull: true
    },
    mpAccessToken: {
      type: DataTypes.STRING,
      allowNull: true
    },
    mpRefreshToken: {
      type: DataTypes.STRING,
      allowNull: true
    },
    mpTokenExpiration: {
      type: DataTypes.DATE,
      allowNull: true
    },
    mp_state: {
      type: DataTypes.STRING,
      allowNull: true
    }
  },
  {
    sequelize,
    modelName: "user",
    underscored: true,
  }
);

export default User;
