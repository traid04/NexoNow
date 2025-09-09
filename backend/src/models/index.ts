import User from "./user";
import Seller from "./seller";
import Product from "./product";
import Category from "./category";
import ProductCategory from "./product_category";
import Review from './review';

// 1:1 association between User and Seller
User.hasOne(Seller);
Seller.belongsTo(User);

// 1:N association between Seller and Product
Seller.hasMany(Product);
Product.belongsTo(Seller);

// N:M association between Product and Category
Product.belongsToMany(Category, { through: ProductCategory });
Category.belongsToMany(Product, { through: ProductCategory });

// 1:N association between Reviews and Seller
Seller.hasMany(Review);
Review.belongsTo(Seller);

// 1:N association between Reviews and User
User.hasMany(Review);
Review.belongsTo(User);

export { User, Seller, Product, Category, ProductCategory, Review };
