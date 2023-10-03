const mongoose = require("mongoose");
const slugify = require("slugify");

// Define the Wishlist schema
const wishlistSchema = new mongoose.Schema(
  {
    // Reference to the user who owns the wishlist
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // Reference to the User model
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    // URL-friendly slug based on the title
    slug: {
      type: String,
    },
    // Counter to differentiate wishlists with the same slug
    slugCounter: {
      type: Number,
    },
    products: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product", // Reference to the Product model
      },
    ],
  },
  { timestamps: true } 
);

// Middleware executed before saving a wishlist document
wishlistSchema.pre("save", async function (next) {
  let slug = "";

  // Check if the title has been modified or if the document is new
  if (this.isModified("title") || this.isNew) {
    // Generate a URL-friendly slug based on the title using slugify
    slug = slugify(`${this.title}`, {
      lower: true, // Convert to lowercase
      remove: /[*+~.()'"!:@]/g, // Remove special characters from the slug
    });
    this.slug = slug;

    // Query the database to find an existing wishlist with the same slug
    const existingCartSlug = await this.constructor.findOne(
      { user: this.user, slug: this.slug }, // Filter by slug
      {}, // Projection (empty to return all fields)
      { sort: { slugCounter: -1 } } // Sort by slugCounter in descending order
    );

    if (existingCartSlug) {
      // If a wishlist with the same slug exists, increment the counter
      this.slugCounter = existingCartSlug.slugCounter + 1;
    } else {
      // If no wishlist with the same slug exists, initialize the counter
      this.slugCounter = 1;
    }
  }

  next(); // Continue with the save operation
});

// Create a Mongoose model named "Wishlist" using the schema
module.exports = mongoose.model("Wishlist", wishlistSchema);
