const express = require("express");
const router = express.Router();
const {
  placeOrder,
  orderHistory,
  getOrder,
  cancelOrder,
} = require("../controllers/orders");
const { advancedResults } = require("../middleware/advancedResults");
const { protect, authorize } = require("../middleware/auth");
const { checkAuthorization } = require("../middleware/checkAuthorization");
const { checkResourceExists } = require("../middleware/checkResourceExists");
const Order = require("../models/Order");

// Protect these routes and ensure the user is authenticated.
router.use(protect, authorize("customer", "site-owner"));

// Middleware function to get user order history and add advanced results.
const getUserOrderHistory = (req, res, next) => {
  advancedResults(
    Order,
    { user: req.user._id },
    {
      path: "items.product",
      select: "name",
    }
  )(req, res, next);
};

// Route for placing a new order.
router.post("/place-order", placeOrder);

// Route for viewing order history for the user.
router.get("/", getUserOrderHistory, orderHistory);

// Route for viewing a specific order's details.
router.get(
  "/:orderId",
  checkResourceExists("order"), // Check if the order resource exists.
  checkAuthorization, // Check if the user is authorized to view this order.
  getOrder
);

router.put(
  "/cancel/:orderId",
  checkResourceExists("order"), // Check if the order resource exists.
  checkAuthorization, // Check if the user is authorized to cancel this order.
  cancelOrder
);

module.exports = router;
