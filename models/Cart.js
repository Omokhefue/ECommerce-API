const mongoose = require("mongoose");
const slugify = require("slugify");

const cartSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: {
      type: String,
      enum: ["My Cart"], // Allow only "My Cart" as an option
      default: "My Cart", // Default title if not provided
    },
    slug: {
      type: String,
    },
    items: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        quantity: {
          type: Number,
          default: 1, 
          min: 1, 
        },
      },
    ],
    totalCost: {
      type: Number,
    },
  },
  { timestamps: true } 
);

// Middleware executed before saving a cart document
cartSchema.pre("save", function (next) {
  // Generate a slug based on the title using slugify
  this.slug = slugify(this.title, { lower: true, remove: /[*+~.()'"!:@]/g });

  next(); // Continue with the save operation
});

// Calculate and update the total cost of the cart after saving
cartSchema.post("save", async function () {
  let totalCost = 0;

  // Populate the 'items.product' field with product details and user details
  await this.populate({
    path: "items.product",
    select: "user name description price image color",
    populate: { path: "user", select: "firstname lastname" },
  });

  // Calculate the total cost by iterating through items
  for (const item of this.items) {
    const { product, quantity } = item;
    if (product && product.price) {
      totalCost += product.price * quantity;
    }
  }

  // Update the 'totalCost' field with the calculated total cost
  this.totalCost = totalCost.toFixed(2); // Fix the total cost to two decimal places
});

module.exports = mongoose.model("Cart", cartSchema); 
