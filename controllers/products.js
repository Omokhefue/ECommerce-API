const Product = require("../models/Product");
const asyncHandler = require("../middleware/async");
const { processImageFile, deleteImage } = require("../utils/imageFileUpload");

exports.getProducts = asyncHandler(async (req, res, next) => {
  res.status(200).json({
    data: res.advancedResults,
  });
});
exports.getProduct = asyncHandler(async (req, res, next) => {
  const product = await Product.findOne({
    slug: req.params.productSlug,
    slugCounter: req.params.productSlugCounter,
  })
  res.status(200).json({ success: true, data: product });
});

exports.addProduct = asyncHandler(async (req, res, next) => {
  let sanitizedImageName;
  const { name, description, price, category, stockQuantity, size, color } =
    req.body;

  if (req.files && req.files.image) {
    sanitizedImageName = await processImageFile(req, res, next, "products");
  }
  const product = await Product.create({
    name,
    description,
    price,
    category,
    stockQuantity,
    size,
    color,
    image: sanitizedImageName,
  });

  res.status(200).json({
    success: "true",
    data: product,
  });
});
exports.deleteProduct = asyncHandler(async (req, res, next) => {
  // Retrieve the category image and delete it
  const productImage = req.resource.image;
  await deleteImage("products", productImage);

  await Product.deleteOne({ _id: req.resource._id });
  res.status(200).json({
    message: "deleted",
  });
});

exports.updateProduct = asyncHandler(async (req, res, next) => {
  const {
    name,
    description,
    price,
    category,
    image,
    stockQuantity,
    size,
    color,
  } = req.body;

  // Check for updates provided in the request body
  if (
    !name &&
    !description &&
    !price &&
    !category &&
    !stockQuantity &&
    !size &&
    !color &&
    !req.files
  ) {
    return next(new ErrorResponse("No update details provided", 400));
  }

  let productToUpdate = req.resource;

  // Initialize sanitizedImageName with the existing image
  let sanitizedImageName = productToUpdate.image;

  // Process image file if provided in the request
  if (req.files && req.files.image) {
    sanitizedImageName = await processImageFile(
      req,
      res,
      next,
      "products",
      sanitizedImageName
    );
  }
  if (name) productToUpdate.name = name;
  if (description) productToUpdate.description = description;
  if (price) productToUpdate.price = price;
  if (category) productToUpdate.category = category;
  if (image) productToUpdate.image = image;
  if (stockQuantity) productToUpdate.stockQuantity = stockQuantity;
  if (size) productToUpdate.size = size;
  if (color) productToUpdate.color = color;
  if (sanitizedImageName) productToUpdate.image = sanitizedImageName;

  productToUpdate = await productToUpdate.save();
  res.status(200).json({
    success: true,
    message: "Product updated",
    data: productToUpdate,
  });
});
exports.searchCategories = asyncHandler(async (req, res, next) => {
  const { query } = req.query;

  // Create a regex pattern to search for categories by name or keyword
  const regexPattern = new RegExp(query, "i");
  const product = await Product.find({
    $or: [
      { name: { $regex: regexPattern } },
      { description: { $regex: regexPattern } },
      { slug: { $regex: regexPattern } },
    ],
  });

  res.status(200).json({ success: true, count: product.length, data: product });
});
