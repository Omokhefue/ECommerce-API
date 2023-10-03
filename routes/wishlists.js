const express = require("express");
const router = express.Router();
const Wishlist = require("../models/Wishlist");
const {
  addToWishlist,
  deleteAllWishlists,
  deleteWishlists,
  viewWishlist,
  viewWishlists,
  updateWishlist,
} = require("../controllers/wishlists");
const { protect, authorize } = require("../middleware/auth");
const { checkAuthorization } = require("../middleware/checkAuthorization");
const { checkResourceExists } = require("../middleware/checkResourceExists");
const { advancedResults } = require("../middleware/advancedResults");

// Use protect and authorize middleware to ensure authentication and authorization
router.use(protect, authorize("customer", "site-owner"));

// Define middleware functions for advanced results
const getAllUserWishlists = (req, res, next) => {
  advancedResults(
    Wishlist,
    { user: req.user._id },
    {
      path: "products",
      select: "name",
    }
  )(req, res, next);
};

const getAllUserWishlistsWithSameSlug = (req, res, next) => {
  advancedResults(
    Wishlist,
    {
      user: req.user._id,
      slug: req.params.wishlistSlug,
    },
    {
      path: "products",
      select: "name",
    }
  )(req, res, next);
};

// Define routes with associated middleware
router.get(
  // Get all wishlists for the user
  "/wishlist",
  getAllUserWishlists,
  viewWishlists
);

router.get(
  // Get all wishlists with the same slug for the user
  "/:wishlistSlug",
  checkResourceExists("wishlist", true),
  getAllUserWishlistsWithSameSlug,
  viewWishlists
);

router.get(
  // Get a specific wishlist with the same slug and slug counter for the user
  "/:wishlistSlug/:wishlistSlugCounter",
  checkResourceExists("wishlist", true),
  checkAuthorization,
  viewWishlist
);

router.post(
  // Add products to the wishlist
  "/add-to-wishlist",
  addToWishlist
);

router.put(
  // Update a wishlist with a specific slug and slug counter for the user
  "/update/:wishlistSlug/:wishlistSlugCounter",
  checkResourceExists("wishlist", true),
  checkAuthorization,
  updateWishlist
);

router.delete(
  // Delete selected wishlists
  "/delete",
  deleteWishlists
);

router.delete(
  // Delete all wishlists for the user
  "/delete-all",
  deleteAllWishlists
);

module.exports = router;
