const mongoose = require("mongoose");
const slugify = require("slugify");

// Define the Product schema using mongoose.Schema
const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true, // Product name is a required field
    },
    description: {
      type: String,
      required: true, // Product description is a required field
    },
    slug: {
      type: String,
    },
    price: {
      type: Number,
      required: true, // Product price is a required field
    },
    slugCounter: {
      type: Number, // Used to differentiate products with the same slug
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category", // Reference to the Category model
      required: true, // Product category is a required field
    },
    image: {
      type: String, // URL or file path to the product image
      required: true, // Product image is a required field
    },
    stockQuantity: {
      type: Number,
      required: true, // Stock quantity is a required field
      min: 0, // Minimum stock quantity should be 0
    },
    size: String, // Optional product size
    color: String, // Optional product color
  },
  { timestamps: true } // Adds createdAt and updatedAt timestamps
);

// Middleware executed before saving a product document
productSchema.pre("save", async function (next) {
  let slug = "";
  // Check if the name has been modified or if the document is new
  if (this.isModified("name") || this.isNew) {
    // Generate a slug based on the product name using slugify
    slug = slugify(`${this.name}`, {
      lower: true, // Convert to lowercase
      remove: /[*+~.()'"!:@]/g, // Remove special characters from the slug
    });
    this.slug = slug;

    // Query the database to find an existing product with the same slug
    const existingProductSlug = await this.constructor.findOne(
      { slug: this.slug }, // Filter by slug
      {}, // Projection (empty to return all fields)
      { sort: { slugCounter: -1 } } // Sort by slugCounter in descending order
    );

    if (existingProductSlug) {
      // If a product with the same slug exists, increment the counter
      this.slugCounter = existingProductSlug.slugCounter + 1;
    } else {
      // If no product with the same slug exists, initialize the counter
      this.slugCounter = 1;
    }
  }

  next(); // Continue with the save operation
});

// Export the Product model
module.exports = mongoose.model("Product", productSchema);
