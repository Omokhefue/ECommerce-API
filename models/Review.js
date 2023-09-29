const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    title: {
      type: String,
      maxlength: 100,
    },
    text: {
      type: String,
      required: true,
      maxlength: 500,
    },
  },
  { timestamps: true }
);

// Static method to get avg rating and save
reviewSchema.statics.getAverageRating = async function (productId) {
  productId = new mongoose.Types.ObjectId(productId);
  const obj = await this.aggregate([
    {
      $match: { product: productId },
    },
    {
      $group: {
        _id: "$product",
        averageRating: { $avg: "$rating" },
      },
    },
  ]);
  try {
    if (obj[0]) {
      // if the product has reviews
      await this.model("Product").findByIdAndUpdate(productId, {
        averageRating: obj[0].averageRating.toFixed(1),
      });
    } else {
      // if the product does nt have reviews
      await this.model("Product").findByIdAndUpdate(productId, {
        averageRating: undefined,
      });
    }
  } catch (err) {
    console.error(err);
  }
};

// Call getAverageRating after save
reviewSchema.post("save", async function () {
  await this.constructor.getAverageRating(this.product);
});

module.exports = mongoose.model("Review", reviewSchema);
