const express = require("express");
const router = express.Router();

// Middleware and controllers
const { protect, authorize } = require("../middleware/auth");
const { checkResourceExists } = require("../middleware/checkResourceExists");
const { checkAuthorization } = require("../middleware/checkAuthorization");
const { advancedResults } = require("../middleware/advancedResults");
const Review = require("../models/Review");
const {
  getReview,
  getReviews,
  addReview,
  deleteReview,
} = require("../controllers/reviews");

// Middleware for advanced results of reviews for one product
const getReviewsForProduct = (req, res, next) => {
  // Use advancedResults middleware to get reviews for a specific product
  advancedResults(Review, { product: req.resource._id })(req, res, next);
};

// Route to get reviews for a specific product
router.get(
  "/product/:productSlug",
  checkResourceExists("product"), // Check if the product exists
  getReviewsForProduct, // Retrieve reviews for the product
  getReviews // Send the reviews in the response
);

// Route to get a specific review by its ID
router.get("/:reviewId", checkResourceExists("review"), getReview);

// Route to add a new review for a product identified by its slug
router.post(
  "/:productSlug",
  protect, // Ensure user is authenticated
  authorize("customer"), // Ensure user has the "customer" role
  checkResourceExists("product"), // Check if the product exists
  addReview // Add a new review
);

// Route to delete a review by its ID
router.delete(
  "/:reviewId",
  protect, // Ensure user is authenticated
  authorize("customer", "site-owner"), // Ensure user has the "customer" or "site-owner" role
  checkResourceExists("review"),
  checkAuthorization, // Check authorization to delete the review
  deleteReview // Delete the review
);

module.exports = router;
