const ErrorResponse = require("../utils/errorResponse"); // Import your ErrorResponse class

// Middleware to check if the user is authorized
exports.checkAuthorization = (req, res, next) => {
  const currentUser = req.user; // Assuming the authenticated user is attached to the request
  const resource = req.resource; // Assuming the resource is attached to the request by the resource existence middleware
  // Check if the user is authorized to perform CRUD operations on the resource
  if (
    currentUser.role !== "site-owner" &&
    currentUser.id !== resource.user.toString()
  ) {
    return next(
      new ErrorResponse(
        `User ${currentUser._id} is not allowed to access the resource ${resource._id}`,
        403
      )
    );
  }
  next();
};
