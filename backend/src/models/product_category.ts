import { DataTypes, Model } from "sequelize";
import { sequelize } from "../utils/db";
import { Product, Category } from "./index";

class ProductCategory extends Model {
  public productId!: number;
  public categoryId!: number;
}

ProductCategory.init(
  {
    productId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      references: {
        model: Product,
        key: "id",
      },
    },
    categoryId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      references: {
        model: Category,
        key: "id",
      },
    },
  },
  {
    sequelize,
    modelName: "product_category",
    underscored: true,
    timestamps: false
  }
);

export default ProductCategory;
