import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../utils/db';
import { User } from './index';

class Notification extends Model {
  declare id: number;
  declare userId: number;
  declare text: string;
  declare type: string;
}

Notification.init(
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
    text: {
      type: DataTypes.STRING,
      allowNull: false
    },
    type: {
      type: DataTypes.STRING,
      allowNull: false
    }
  },
  {
    sequelize,
    modelName: "notification",
    underscored: true
  }
)

export default Notification;