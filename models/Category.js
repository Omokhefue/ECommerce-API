const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
    },
    slug: {
      type: String,
      unique: true, // Ensure that slugs are unique
      required: true,
    },
    parentCategory: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category", // Reference to the Category model
      default: null, // If it's a top-level category, set it to null
    },
    subcategories: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Category", // Reference to the Category model
      },
    ],

    products: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Category", categorySchema);
