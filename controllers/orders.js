const ErrorResponse = require("../utils/errorResponse");
const Order = require("../models/Order");
const asyncHandler = require("../middleware/async");

// POST /api/orders/place-order: Place a new order.
exports.placeOrder = asyncHandler(async (req, res, next) => {
  // Extract the relevant data from the request body.
  const { items, shippingAddress } = req.body;
  const user = req.user._id;

  // Create a new order document based on the extracted data.
  const order = new Order({
    user,
    items,
    shippingAddress,
  });

  // Save the new order in the database.
  await order.save();

  // Respond with a success message and the created order.
  res.status(201).json({
    success: true,
    message: "Your order has been recorded!",
    data: order,
  });
});

// GET /api/orders: View order history for the user.
exports.orderHistory = asyncHandler(async (req, res, next) => {
  // Respond with the advanced results, which contain the user's order history.
  res.json(res.advancedResults);
});

// GET /api/orders/:orderId: View a specific order's details.
exports.getOrder = asyncHandler(async (req, res, next) => {
  // Get the specific order from the request resource.
  const order = req.resource;

  // Respond with the specific order details.
  res.status(201).json({ success: true, data: order });
});

// PUT /api/orders/cancel/:orderId: Cancel an order (if allowed).
exports.cancelOrder = asyncHandler(async (req, res, next) => {
  // Get the order from the request resource.
  let order = req.resource;

  // Check if the order can be canceled based on its status.
  if (order.status !== "processing") {
    return next(
      new ErrorResponse(
        `That order cannot be canceled because it has been shipped and will be delivered soon`,
        400
      )
    );
  }

  // Update the order's status to "cancelled" in the database.
  order = await Order.updateOne(
    { _id: order._id, status: "processing" },
    { status: "cancelled" }
  );

  // Respond with a success message indicating that the order has been canceled.
  res
    .status(200)
    .json({ success: true, message: "Your order has been canceled" });
});
