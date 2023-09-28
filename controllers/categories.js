// Import required modules
const Category = require("../models/Category");
const asyncHandler = require("../middleware/async");
const ErrorResponse = require("../utils/errorResponse");
const { processImageFile, deleteImage } = require("../utils/imageFileUpload");

// Create a new category
exports.addCategory = asyncHandler(async (req, res, next) => {
  // Initialize variables
  let sanitizedImageName;
  const { name, description, parentCategory, subcategories } = req.body;

  // Process image file if provided
  if (req.files && req.files.image) {
    sanitizedImageName = await processImageFile(req, res, next, "categories");
  }

  // Create a new category in the database
  const category = await Category.create({
    name,
    description,
    image: sanitizedImageName,
    parentCategory,
    subcategories,
  });

  // Send a success response
  res.status(201).json({ success: true, data: category });
});

// Get all parent categories, all subcategories and all categories under one category
exports.getCategories = asyncHandler(async (req, res, next) => {
  // Send a response with advanced results
  res.status(200).json(res.advancedResults);
});

// Get a single category by ID
exports.getSingleCategory = asyncHandler(async (req, res, next) => {
  // Find a single category by slug and populate subcategories and parentCategory
  const category = await Category.find({ slug: req.params.categorySlug })
    .populate("subcategories")
    .populate("parentCategory");

  // Send a response with the category data
  res.status(200).json({ success: true, data: category });
});

// Update a category by ID
exports.updateCategory = asyncHandler(async (req, res, next) => {
  // Retrieve the category from the request resource
  const category = req.resource;
  const { name, description, parentCategory, subcategories } = req.body;

  // Check for updates provided in the request body
  if (
    !name &&
    !description &&
    !parentCategory &&
    !subcategories &&
    !req.files
  ) {
    return next(new ErrorResponse("No update details provided", 400));
  }

  // Initialize sanitizedImageName with the existing image
  let sanitizedImageName = category.image;

  // Process image file if provided in the request
  if (req.files && req.files.image) {
    sanitizedImageName = await processImageFile(
      req,
      res,
      next,
      "categories",
      sanitizedImageName
    );
  }

  // Update category properties if provided in the request body
  if (name) category.name = name;
  if (description) category.description = description;
  if (parentCategory) category.parentCategory = parentCategory;
  if (subcategories) category.subcategories = subcategories;
  if (sanitizedImageName) category.image = sanitizedImageName;

  // Save the updated category in the database
  const updatedCategory = await category.save();

  // Send a response with the updated category data
  res.status(200).json({ success: true, data: updatedCategory });
});

// Delete a category by ID
exports.deleteCategory = asyncHandler(async (req, res, next) => {
  // Retrieve the category image and delete it
  const categoryImage = req.resource.image;
  await deleteImage("categories", categoryImage);

  // Delete the category from the database
  await Category.deleteOne({ _id: req.resource._id });

  // Send a success response
  res.status(204).json({ message: "deleted" });
});

// Get the parent category of a category
exports.getParentCategory = asyncHandler(async (req, res, next) => {
  // Retrieve the category from the request resource
  const category = req.resource;

  // Check if the category has a parent
  if (category.parentCategory) {
    // Retrieve and populate the parentCategory
    const parentCategory = await Category.findById(category.parentCategory);
    if (!parentCategory) {
      return res.status(404).json({ success: false, data: category });
    }

    // Send a response with the parentCategory data
    res.status(200).json({ success: true, data: parentCategory });
  }
});

// Search for categories by name or keyword
exports.searchCategories = asyncHandler(async (req, res, next) => {
  // Extract the query parameter from the request
  const { query } = req.query;

  // Create a regex pattern to search for categories by name, description, or slug
  const regexPattern = new RegExp(query, "i");

  // Find categories matching the regex pattern
  const categories = await Category.find({
    $or: [
      { name: { $regex: regexPattern } },
      { description: { $regex: regexPattern } },
      { slug: { $regex: regexPattern } },
    ],
  });

  // Send a response with the search results
  res
    .status(200)
    .json({ success: true, count: categories.length, data: categories });
});
