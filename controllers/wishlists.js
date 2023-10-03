const Wishlist = require("../models/Wishlist");
const ErrorResponse = require("../utils/errorResponse");
const asyncHandler = require("../middleware/async");

// View a single wishlist
exports.viewWishlist = asyncHandler(async (req, res, next) => {
  const userWishlist = await req.resource.populate({
    path: "products",
    select: "name",
  });

  res.status(200).json({ success: true, data: userWishlist });
});

// View all wishlists
exports.viewWishlists = asyncHandler(async (req, res, next) => {
  // Return a list of wishlists using the advancedResults middleware
  res.status(200).json(res.advancedResults);
});

// Add or update items in the wishlist
exports.addToWishlist = asyncHandler(async (req, res, next) => {
  let wishlist;
  const { user } = req;
  const { title, slug, slugCounter, products } = req.body;

  // Check if a valid slug and slug counter are provided
  if (slug && slugCounter) {
    // Find the wishlist by user, slug, and slugCounter
    wishlist = await Wishlist.findOne({
      user: user._id,
      slug,
      slugCounter,
    });

    if (wishlist) {
      // Wishlist exists, update its title and add or update products
      wishlist.title = title;

      for (const productId of products) {
        if (!wishlist.products.includes(productId)) {
          wishlist.products.push(productId);
        } else {
          return next(
            new ErrorResponse(
              `Product ${productId} is already in your wishlist`,
              400
            )
          );
        }
      }
    } else {
      // Wishlist doesn't exist, create a new one
      wishlist = new Wishlist({
        user: user._id,
        title,
        products,
      });
    }

    wishlist = await wishlist.save();

    return res.status(200).json({
      success: true,
      message: "Products added/updated in wishlist",
      data: wishlist,
    });
  }

  // Handle invalid slug and slugCounter
  wishlist = await wishlist.save();

  res.status(200).json({
    success: true,
    message: "Products added/updated in wishlist",
    data: wishlist,
  });
});

// Update a wishlist (title or remove items)
exports.updateWishlist = asyncHandler(async (req, res, next) => {
  const { title, productsToRemove } = req.body;
  let wishlist = req.resource;

  if (productsToRemove) {
    if (!Array.isArray(productsToRemove)) {
      return res.status(400).json({
        success: false,
        message: "Invalid input, products to remove should be an array",
      });
    }

    // Remove specified products from the wishlist
    wishlist.products = wishlist.products.filter(
      (product) => !productsToRemove.includes(product.toString())
    );
  }

  if (title) {
    // Update the wishlist title if provided
    wishlist.title = title;
  }

  wishlist = await wishlist.save();

  res
    .status(200)
    .json({ success: true, message: "Wishlist updated", wishlist });
});

// Delete selected wishlists
exports.deleteWishlists = asyncHandler(async (req, res, next) => {
  const { wishlistsToRemove } = req.body;

  if (!Array.isArray(wishlistsToRemove)) {
    return res.status(400).json({
      success: false,
      message: "Invalid input, wishlists to remove should be an array",
    });
  }

  // Delete specified wishlists
  for (const wishlist of wishlistsToRemove) {
    await Wishlist.deleteOne({ _id: wishlist, user: req.user._id });
  }

  res.status(200).json({ success: true, message: "Wishlists deleted" });
});

// Delete all wishlists of the user
exports.deleteAllWishlists = asyncHandler(async (req, res, next) => {
  // Delete all wishlists associated with the user
  await Wishlist.deleteMany({ user: req.user._id });

  res.status(200).json({
    success: true,
    message: `Deleted all wishlists for user ${req.user._id}`,
  });
});
