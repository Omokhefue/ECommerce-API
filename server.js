const express = require("express");

// module
require("dotenv").config({ path: "./config/.env" });
const fileUpload = require("express-fileupload");
const connectDB = require("./config/db");

// routes
const auth = require("./routes/auth");
const users = require("./routes/users");
const categories = require("./routes/categories");
const products = require("./routes/products");
const reviews = require("./routes/reviews");
const carts = require("./routes/carts");
const wishlists = require("./routes/wishlists");
const orders = require("./routes/orders");
const errorHandler = require("./middleware/error");

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static("public"));
app.use(fileUpload());

app.use("/api/auth", auth);
app.use("/api/users", users);
app.use("/api/categories", categories);
app.use("/api/products", products);
app.use("/api/carts", carts);
app.use("/api/wishlists", wishlists);
app.use("/api/orders", orders);
app.use("/api/reviews", reviews);

app.use(errorHandler);

connectDB().then(() =>
  app.listen(
    process.env.PORT || 3000,
    console.log(`server running on port ${process.env.PORT}`)
  )
);

process.on("unhandledRejection", (err, promise) => {
  console.log("Unhandled Rejection:", err.message);
  process.exit(1);
});
