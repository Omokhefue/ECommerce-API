const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User", // Reference to the User model
    required: true,
  },
  items: [
    {
      product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product", // Reference to the Product model
        required: true,
      },
      quantity: {
        type: Number,
        required: true,
        min: 1,
      },
    },
  ],
  totalAmount: {
    type: Number,
  },
  orderDate: {
    type: Date,
    default: Date.now,
  },
  shippingAddress: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ["processing", "shipped", "delivered", "cancelled"],
    default: "processing",
  },
});

// Pre-save middleware to calculate the totalAmount based on item prices and quantities.
orderSchema.pre("save", async function () {
  console.log("heredeeee");
  let totalAmount = 0;

  // Populate the 'items.product' field with 'name' and 'price'.
  await this.populate({
    path: "items.product",
    select: "name price",
  });

  // Calculate the totalAmount based on item prices and quantities.
  for (const item of this.items) {
    const { product, quantity } = item;
    if (product && product.price) {
      totalAmount += product.price * quantity;
    }
  }

  // Fix the total cost to two decimal places and assign it to 'totalAmount'.
  this.totalAmount = totalAmount.toFixed(2);
});

// Create and export the 'Order' model using the schema.
module.exports = mongoose.model("Order", orderSchema);
