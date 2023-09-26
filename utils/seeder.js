const fs = require("fs");
const mongoose = require("mongoose");

require("dotenv").config({ path: "../config/.env" });

mongoose.connect(process.env.MONGO_URI);

// import resource model
const User = require("../models/User");
const Category = require("../models/Category");
const Product = require("../models/Product");
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
// add files to database
const importData = async () => {
  try {
    // create resource
    await User.create(users);
    await Category.create(categories);
    await Product.create(products)
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
