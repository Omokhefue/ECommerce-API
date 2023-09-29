// Import required modules
const Review = require("../models/Review");
const asyncHandler = require("../middleware/async");

// Get a list of reviews
exports.getReviews = asyncHandler(async (req, res, next) => {
  res.status(200).json(res.advancedResults);
});

// Get a single review by ID
exports.getReview = asyncHandler(async (req, res, next) => {
  const review = await Review.findOne({ _id: req.params.reviewId });

  res.status(200).json({ review });
});

// Add a new review
exports.addReview = asyncHandler(async (req, res, next) => {
  // Extract review properties from the request body
  const { rating, title, text } = req.body;

  // Create a new review document
  const review = await Review.create({
    user: req.user._id,
    product: req.resource._id,
    rating,
    title,
    text,
  });

  res.status(201).json({ review });
});

// Delete a review by ID
exports.deleteReview = asyncHandler(async (req, res, next) => {
  await Review.deleteOne({ _id: req.params.reviewId }); //delete review
  await Review.getAverageRating(req.resource.product); //call static function and update the product averageRating

  res.status(200).json({ message: "deleted" });
});
