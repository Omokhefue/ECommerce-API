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
    // check for whichever model exist in youtr api application
    default:
      return null;
  }
};

// Middleware to check if the resource exists
exports.checkResourceExists = (resourceType) => {
  return asyncHandler(async (req, res, next) => {
    let resource;
    const resourceSlug = req.params[`${resourceType}Slug`]; // Extract the resource identifier from the request
    const resourceSlugCounter = req.params[`${resourceType}SlugCounter`]; // Extract the resource identifier from the request
    // Dynamically determine the model to use based on the resourceType
    const Model = getResourceModel(resourceType);
    if (!Model) {
      return next(
        new ErrorResponse(`Invalid resource type: ${resourceType}`, 400)
      );
    }
console.log(resourceSlug,resourceSlugCounter)
    if (resourceSlugCounter) {
      resource = await Model.findOne({
        slug: resourceSlug,
        slugCounter: resourceSlugCounter,
      });
    } else {
      resource = await Model.findOne({ slug: resourceSlug }); // Replace with your resource lookup logic
    }

    if (!resource) {
      return next(new ErrorResponse(`${resourceType} not found`, 404));
    }

    // Attach the resource to the request for later middleware to use if needed
    req.resource = resource;
    next();
  });
};
