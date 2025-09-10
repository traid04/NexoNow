import User from "./user";
import Seller from "./seller";
import Product from "./product";
import Category from "./category";
import Review from './review';
import ProductPhoto from "./product_photo";

// 1:1 association between User and Seller
User.hasOne(Seller);
Seller.belongsTo(User);

// 1:N association between Seller and Product
Seller.hasMany(Product);
Product.belongsTo(Seller);

// 1:N association between Categories and Product
Product.belongsTo(Category);
Category.hasMany(Product);

// 1:N association between Reviews and Seller
Seller.hasMany(Review);
Review.belongsTo(Seller);

// 1:N association between Reviews and User
User.hasMany(Review);
Review.belongsTo(User);

// 1:N association between Product photos and Products
Product.hasMany(ProductPhoto);
ProductPhoto.belongsTo(Product);

export { User, Seller, Product, Category, Review, ProductPhoto };
