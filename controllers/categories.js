const Category = require("../models/Category");
const asyncHandler = require("../middleware/async");

// Create a new category
exports.addCategpry = asyncHandler(async (req, res, next) => {
  let sanitizedImageName;
  const { name, description } = req.body;

  if (req.files && req.files.image) {
    sanitizedImageName = await processImageFile(req, res, next, "categories");
  }
  const category = await Category.create({
    name,
    description,
    image: sanitizedImageName,
  });
  res.status(201).json({ success: true, data: category });
});

// Get all categories
exports.getCategories = asyncHandler(async (req, res, next) => {
  res.status(200).json(res.advancedResults);
});

// Get a single category by ID
exports.getSingleCategory = asyncHandler(async (req, res, next) => {
  const category = await Category.findById(req.params.CategoryId);

  res.status(200).json({ success: true, data: category });
});

// Update a category by ID
exports.updateCategory = asyncHandler(async (req, res, next) => {
  const category = await User.findById(req.params.CategoryId);
  const name = req.body.name;
  const description = req.body.description;

  let sanitizedImageName = category.image;
  if (req.files && req.files.image) {
    sanitizedImageName = await processImageFile(
      req,
      res,
      next,
      "categories",
      sanitizedImageName
    );
  }

  const fieldsToUpdate = {};
  if (name) fieldsToUpdate.name = name;
  if (description) fieldsToUpdate.description = description;
  if (sanitizedImageName) fieldsToUpdate.image = sanitizedImageName;
  const updatedCategory = await Category.findByIdAndUpdate(
    req.params.categoryId,
    req.body,
    {
      new: true,
      runValidators: true,
    }
  );

  res.status(200).json({ success: true, data: updatedCategory });
});

// Delete a category by ID
exports.deleteCategory = asyncHandler(async (req, res, next) => {
  const CategoryId = req.params.UserId;
  await User.deleteOne({ _id: CategoryId });
  res.status(204).json({ message: "deleted" });
});
