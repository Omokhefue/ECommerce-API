const fs = require("fs");
const mongoose = require("mongoose");

require("dotenv").config({ path: "../config/.env" });

mongoose.connect(process.env.MONGO_URI);
// import resource model
const User = require("../models/User");
const Category = require("../models/Category");
const Product = require("../models/Product");
const Review = require("../models/Review");
const Cart = require("../models/Cart");
const Wishlist = require("../models/Wishlist");
const Order = require("../models/Order");
// reading the file content of resource
const users = JSON.parse(
  fs.readFileSync(`${__dirname}/../data/user.json`, "utf-8")
);
const categories = JSON.parse(
  fs.readFileSync(`${__dirname}/../data/category.json`, "utf-8")
);
const products = JSON.parse(
  fs.readFileSync(`${__dirname}/../data/product.json`, "utf-8")
);
const reviews = JSON.parse(
  fs.readFileSync(`${__dirname}/../data/review.json`, "utf-8")
);
const carts = JSON.parse(
  fs.readFileSync(`${__dirname}/../data/cart.json`, "utf-8")
);
const wishlists = JSON.parse(
  fs.readFileSync(`${__dirname}/../data/wishlist.json`, "utf-8")
);
const orders = JSON.parse(
  fs.readFileSync(`${__dirname}/../data/order.json`, "utf-8")
);
// add files to database
const importData = async () => {
  try {
    // create resource
    await User.create(users);
    await Category.create(categories);
    await Product.create(products);
    await Review.create(reviews);
    await Cart.create(carts);
    await Wishlist.create(wishlists);
    await Order.create(orders);
    console.log("data imported");
    process.exit(1);
  } catch (error) {
    console.log(`${error}, occured while importing data`);
  }
};

// deleting files from databse
const deleteData = async () => {
  try {
    // delete resource
    await User.deleteMany();
    await Category.deleteMany();
    await Product.deleteMany();
    await Review.deleteMany();
    await Cart.deleteMany();
    await Wishlist.deleteMany();
    await Order.deleteMany();
    console.log("data deleted");
    process.exit(1);
  } catch (error) {
    console.log(`${error}, occured while deleting data`);
  }
};

if (process.argv[2] === "-i") {
  importData();
}
if (process.argv[2] === "-d") {
  deleteData();
}
