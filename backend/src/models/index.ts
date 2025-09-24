import User from "./user";
import Seller from "./seller";
import Product from "./product";
import Category from "./category";
import Review from './review';
import ProductPhoto from "./product_photo";
import ProductHistory from "./product_history";
import Favorite from "./favorite";
import Cart from "./cart";

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

// 1:N association between Product record and Products
ProductHistory.belongsTo(Product);
Product.hasMany(ProductHistory);

// 1:N association between Product record and Users
ProductHistory.belongsTo(User);
User.hasMany(ProductHistory);

// N:M association between Product, User and Favorites
Product.belongsToMany(User, { through: Favorite, as: "favoritedBy" });
User.belongsToMany(Product, { through: Favorite, as: "favorites" });

// N:M association between User, Product and Cart
Cart.belongsTo(User);
User.hasMany(Cart);
Cart.belongsTo(Product);
Product.hasMany(Cart);

export { User, Seller, Product, Category, Review, ProductPhoto, ProductHistory, Favorite, Cart };