const express = require("express");
const router = express.Router();

const { protect, authorize } = require("../middleware/auth");
const { checkResourceExists } = require("../middleware/checkResourceExists");
const {
  getCategories,
  addCategory,
  deleteCategory,
  updateCategory,
  getSingleCategory,
  getParentCategory,
  searchCategories,
} = require("../controllers/categories");
const { advancedResults } = require("../middleware/advancedResults");
const Category = require("../models/Category");

// Middleware for advanced results of subcategories under one category
const subcategoriesForCategory = (req, res, next) => {
  advancedResults(
    Category,
    { parentCategory: req.resource._id },
    "subcategories"
  )(req, res, next);
};

// Middleware for advanced results of all subcategories
const topLevelSubcategories = (req, res, next) => {
  advancedResults(Category, { parentCategory: { $ne: null } }, "subcategories")(
    req,
    res,
    next
  );
};
router.get("/search", searchCategories);
router.get(
  "/parentcategories",
  advancedResults(Category, { parentCategory: null }, "subcategories"),
  getCategories
); //done
router.get("/subcategories", topLevelSubcategories, getCategories);
router.get(
  "/:categorySlug",
  checkResourceExists("category"),
  getSingleCategory
);
router.post("/", protect, authorize("site-owner"), addCategory);
router.put(
  "/:categorySlug",
  protect,
  authorize("site-owner"),
  checkResourceExists("category"),
  updateCategory
);
router.delete(
  "/:categorySlug",
  protect,
  authorize("site-owner"),
  checkResourceExists("category"),
  deleteCategory
);
router.get(
  "/:categorySlug/subcategories",
  checkResourceExists("category"),
  subcategoriesForCategory,
  getCategories
);
router.get(
  "/:categorySlug/category",
  checkResourceExists("category"),
  getParentCategory
);

module.exports = router;
