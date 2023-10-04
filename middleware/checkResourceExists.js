const asyncHandler = require("./async");
const ErrorResponse = require("../utils/errorResponse"); // Import your ErrorResponse class

const getResourceModel = (resourceType) => {
  switch (resourceType) {
    case "user":
      return require("../models/User");
    case "category":
      return require("../models/Category");
    case "product":
      return require("../models/Product");
    case "review":
      return require("../models/Review");
    case "cart":
      return require("../models/Cart");
    case "wishlist":
      return require("../models/Wishlist");
    case "order":
      return require("../models/Order");
    // check for whichever model exist in your api application
    default:
      return null;
  }
};

// Middleware to check if the resource exists
exports.checkResourceExists = (resourceType, user) => {
  return asyncHandler(async (req, res, next) => {
    let resource;
    const resourceId = req.params[`${resourceType}Id`];
    const resourceSlug = req.params[`${resourceType}Slug`];
    const resourceSlugCounter = req.params[`${resourceType}SlugCounter`];
    const query = {};

    if (resourceId) {
      query._id = resourceId;
    }
    console.log(resourceId);
    if (resourceSlugCounter && resourceSlug) {
      query.slug = resourceSlug;
      query.slugCounter = resourceSlugCounter;
    } else if (resourceSlug) {
      query.slug = resourceSlug;
    }

    if (user) {
      query.user = req.user._id;
    }
console.log(query)
    const Model = getResourceModel(resourceType);

    if (!Model) {
      return next(
        new ErrorResponse(`Invalid resource type: ${resourceType}`, 400)
      );
    }

    resource = await Model.findOne(query);

    if (!resource) {
      return next(new ErrorResponse(`${resourceType} not found`, 404));
    }
    console.log("from check resource", resource);
    req.resource = resource;
    next();
  });
};
