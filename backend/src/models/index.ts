import User from "./user";
import Seller from "./seller";
import Product from "./product";
import Category from "./category";
import ProductCategory from "./product_category";

// 1:1 association between User and Seller
User.hasOne(Seller);
Seller.belongsTo(User);

// 1:N association between Seller and Product
Seller.hasMany(Product);
Product.belongsTo(Seller);

// N:M association between Product and Category
Product.belongsToMany(Category, { through: ProductCategory });
Category.belongsToMany(Product, { through: ProductCategory });

export { User, Seller, Product, Category, ProductCategory };
