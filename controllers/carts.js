const asyncHandler = require("../middleware/async");
const Cart = require("../models/Cart"); // Import your Cart model
const ErrorResponse = require("../utils/errorResponse");

// Route to view the user's shopping cart
exports.viewShoppingCart = asyncHandler(async (req, res, next) => {
  // Find the user's shopping cart and populate it with product details
  let userShoppingCart = await Cart.findOne({
    user: req.user._id,
  }).populate({
    path: "items.product",
    select: "user name description price image color",
    populate: { path: "user", select: "firstname lastname" },
  });

  // Check if the user has a shopping cart
  if (!userShoppingCart) {
    return res.status(404).json({
      success: false,
      message: `User ${req.user.slug} does not yet have a cart`,
    });
  }

  // Return the user's shopping cart
  res.status(200).json({
    success: true,
    NumberOfItems: `${userShoppingCart.items.length}`,
    data: userShoppingCart,
  });
});

// Route to add products to the cart
exports.addToCart = asyncHandler(async (req, res, next) => {
  const { user } = req; // Assuming you have the user available in req
  const { items } = req.body;

  // Check if items were provided in the request
  if (!items) {
    return next(new ErrorResponse(`No item was passed in the request`, 404));
  }

  // Find the user's cart or create one if it doesn't exist
  let cart = await Cart.findOne({ user: user._id });

  if (!cart) {
    cart = await Cart.create({ user: user._id, items });
  } else {
    // Iterate through the items in the request body
    for (const item of items) {
      const { product: productId, quantity } = item;

      // Check if the product is already in the cart
      const existingCartItem = cart.items.find((cartItem) =>
        cartItem.product.equals(productId)
      );

      if (existingCartItem) {
        // If the product is already in the cart, update the quantity
        existingCartItem.quantity = quantity;
      } else {
        // If the product is not in the cart, add it
        cart.items.push({ product: productId, quantity });
      }
    }

    // Save the cart
    await cart.save();
  }

  // Return a success message
  res.status(200).json({
    success: true,
    message: "Products added/updated in cart",
    data: cart,
  });
});

// Route to update the quantity of products in the cart
exports.updateCartProductQuantity = asyncHandler(async (req, res, next) => {
  const { items } = req.body;

  // Check if items were provided in the request
  if (!items || !Array.isArray(items) || items.length === 0) {
    return next(
      new ErrorResponse(`No valid items were provided in the request`, 400)
    );
  }

  const userCart = req.resource;

  for (const item of items) {
    const { product: productId, quantity } = item;

    // Find the cart item by product ID
    const existingCartItem = userCart.items.find((cartItem) =>
      cartItem.product.equals(productId)
    );

    if (existingCartItem) {
      // If the product is already in the cart, update the quantity
      existingCartItem.quantity = quantity;
    } else {
      continue;
    }
  }

  // Save the updated cart
  const cart = await userCart.save();

  // Return a success message
  res.status(200).json({ success: true, message: "Cart updated", data: cart });
});

// Route to remove products from the cart
exports.removeFromCart = asyncHandler(async (req, res, next) => {
  const productsToRemove = req.body.productsToRemove;
  let cart = req.resource;

  // Ensure that productsToRemove is an array
  if (!Array.isArray(productsToRemove)) {
    return res.status(400).json({ success: false, message: "Invalid input" });
  }

  // Filter out the products to be removed from the cart
  cart.items = cart.items.filter(
    (item) => !productsToRemove.includes(item.product.toString())
  );

  // Save the updated cart
  cart = await cart.save();

  // Return a success message
  res
    .status(200)
    .json({ success: true, message: "Products removed from cart", cart });
});

// Route to delete the entire cart
exports.deleteCart = asyncHandler(async (req, res, next) => {
  // Delete the user's cart
  await Cart.deleteOne({ user: req.user._id });

  // Return a success message
  res.status(200).json({ success: true, message: "Cart deleted!" });
});
