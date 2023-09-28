const express = require("express");
const router = express.Router();

const { protect, authorize } = require("../middleware/auth");
const { checkResourceExists } = require("../middleware/checkResourceExists");
const { checkAuthorization } = require("../middleware/checkAuthorization");
const {
  getProducts,
  getProduct,
  addProduct,
  deleteProduct,
  searchCategories,
  updateProduct,
} = require("../controllers/products");
const { advancedResults } = require("../middleware/advancedResults");

const getProductsByCategory = (req, res, next) => {
  // Pass req to the advancedResults middleware
  advancedResults(Product, { category: req.resource._id })(req, res, next);
};
const getProductsBySlug = (req, res, next) => {
  // Pass req to the advancedResults middleware
  advancedResults(Product, { slug: req.resource.slug })(req, res, next);
};

const Product = require("../models/Product");

router.get("/search", searchCategories);
router.get("/", advancedResults(Product), getProducts);
router.post("/", protect, authorize("admin"), addProduct);

router.get("/new-arrivals", advancedResults(Product), getProducts);

router.get(
  "/:categorySlug/products",
  checkResourceExists("category"),
  getProductsByCategory,
  getProducts
);
router.get(
  "/:productSlug",
  checkResourceExists("product"),
  getProductsBySlug,
  getProducts
);
router.get(
  "/:productSlug/:productSlugCounter",
  checkResourceExists("product"),
  getProduct
);
router.put(
  "/:productSlug/:productSlugCounter",
  protect,
  authorize("admin"),
  checkResourceExists("product"),
  checkAuthorization,
  updateProduct
);
router.delete(
  "/:productSlug/:productSlugCounter",
  protect,
  authorize("admin"),
  checkResourceExists("product"),
  checkAuthorization,
  deleteProduct
);
module.exports = router;
