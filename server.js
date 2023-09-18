const express = require("express");
require("dotenv").config({ path: "./config/.env" });
const connectDB = require("./config/db");

const app = express();

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
