const express = require("express");
const router = express.Router();

const { protect, authorize } = require("../middleware/auth");
const { checkResourceExists } = require("../middleware/checkResourceExists");
const { checkAuthorization } = require("../middleware/checkAuthorization");
const {
  getCategories,
  addCategpry,
  deleteCategory,
  updateCategory,
  getSingleCategory,
} = require("../controllers/categories");
const { advancedResults } = require("../middleware/advancedResults");
const Category = require("../models/Category");

router.get(
  "/",
  advancedResults(Category, null, "subcategories"),
  getCategories
);
router.get("/:CategoryId", getSingleCategory);
router.post("/", protect, authorize("site-owner"), addCategpry);
router.put(
  "/:categoryId",
  protect,
  authorize("site-owner"),
  checkResourceExists("Category"),
  checkAuthorization,
  updateCategory
);
router.delete(
  "/:categoryId",
  protect,
  authorize("site-owner"),
  checkResourceExists("Category"),
  checkAuthorization,
  deleteCategory
);

module.exports = router;
