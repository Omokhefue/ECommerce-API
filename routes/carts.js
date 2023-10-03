const express = require("express");
const router = express.Router();
const {
  viewShoppingCart,
  addToCart,
  updateCartProductQuantity,
  removeFromCart,
  deleteCart,
} = require("../controllers/carts");
const { protect, authorize } = require("../middleware/auth");
const { checkAuthorization } = require("../middleware/checkAuthorization");
const { checkResourceExists } = require("../middleware/checkResourceExists");

router.use(protect, authorize("customer", "site-owner")); // Protect these routes, ensure the user is authenticated

// Get the user's shopping cart
router.get("/my-cart", viewShoppingCart);

// Add products to the cart
router.post("/add-to-cart", addToCart);

// Update the quantity of a product in the cart
router.put(
  "/update/:cartSlug",
  checkResourceExists("cart"), // Check if the cart exists
  checkAuthorization, // Check if the user is authorized to perform this action
  updateCartProductQuantity
);

// Remove a product from the cart
router.put(
  "/:cartSlug/remove-from-cart",
  checkResourceExists("cart"), // Check if the cart exists
  checkAuthorization, // Check if the user is authorized to perform this action
  removeFromCart
);

// Delete the entire cart
router.delete(
  "/delete/:cartSlug",
  checkResourceExists("cart"), // Check if the cart exists
  checkAuthorization, // Check if the user is authorized to perform this action
  deleteCart
);

module.exports = router;
