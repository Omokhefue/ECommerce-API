// Import required modules
const mongoose = require("mongoose");
const slugify = require("slugify");

// Define the schema for the 'Category' model
const categorySchema = new mongoose.Schema(
  {
    // Name of the category (required and unique)
    name: {
      type: String,
      required: true,
      unique: true,
    },
    // Description of the category (required)
    description: {
      type: String,
      required: true,
    },
    // Image URL for the category (required)
    image: {
      type: String,
      required: true,
    },
    // Slug generated from the name (unique, auto-generated)
    slug: {
      type: String,
      unique: true, // Ensure that slugs are unique
    },
    // Parent category reference (nullable, refers to the Category model)
    parentCategory: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category", // Reference to the Category model
      default: null, // If it's a top-level category, set it to null
    },
    // Subcategories (array of references to the Category model)
    subcategories: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Category", // Reference to the Category model
      },
    ],
    // Products (array of references to the Product model)
    products: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
      },
    ],
  },
  // Additional schema options (timestamps)
  { timestamps: true }
);

// Middleware: Pre-save hook to generate the slug
categorySchema.pre("save", function (next) {
  // Check if the name has been modified or if the document is new
  if (this.isModified("name") || this.isNew) {
    // Use slugify to generate a slug from the name field
    this.slug = slugify(this.name, { lower: true, remove: /[*+~.()'"!:@]/g });
  }
  next();
});

// Export the 'Category' model
module.exports = mongoose.model("Category", categorySchema);
