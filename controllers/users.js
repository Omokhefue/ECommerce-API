// get all users
// get single user - under user profile, show all recipes the user has, how the user email - if available
// add a user
const ErrorResponse = require("../utils/errorResponse");
const User = require("../models/User");
const asyncHandler = require("../middleware/async");
const { processImageFile, deleteImage } = require("../utils/imageFileUpload");
const bcrypt = require("bcryptjs");

exports.updateDetails = asyncHandler(async (req, res, next) => {
  const user = await User.find(req.params.userSlug);

  const { firstname, lastname, email } = req.body;
  if (user.id !== req.user.id) {
    return next(
      new ErrorResponse(
        `User ${req.user._id} is not authorized to make changes to resource ${user._id}`,
        403
      )
    );
  }

  if (!firstname && !lastname && !email && !req.files) {
    return next(new ErrorResponse("No update details provided", 400));
  }

  let sanitizedImageName = user.image;
  if (req.files && req.files.image) {
    sanitizedImageName = await processImageFile(
      req,
      res,
      next,
      "users",
      sanitizedImageName
    );
  }

  // Construct fields to update
  const fieldsToUpdate = {};
  if (firstname) fieldsToUpdate.firstname = firstname;
  if (lastname) fieldsToUpdate.lastname = lastname;
  if (email && email !== user.email) fieldsToUpdate.email = email;
  if (sanitizedImageName) fieldsToUpdate.image = sanitizedImageName;

  const updatedUser = await User.findByIdAndUpdate(
    req.user.id,
    fieldsToUpdate,
    {
      new: true,
      runValidators: true,
    }
  );

  res.status(200).json({
    success: true,
    data: updatedUser,
  });
});
exports.updateCustomerRoleToAdmin = asyncHandler(async (req, res, next) => {
  // Find the user by ID
  const user = await User.find(req.params.userSlug);
  if (user.id !== req.user.id) {
    return next(
      new ErrorResponse(
        `User ${req.user.slug} is not authorized to make changes to resource ${user.slug}`,
        403
      )
    );
  }
  // Update the user's role
  user.role = "admin"; // Assuming role is passed in the request body

  // Save the updated user
  await user.save();

  res.status(200).json({ success: true, data: user });
});

exports.updatePassword = asyncHandler(async (req, res, next) => {
  const newPassword = req.body.newPassword;
  const currentPassword = req.body.currentPassword;

  const user = await User.find(req.params.userSlug).select("+password");

  if (user.id !== req.user.id) {
    return next(
      new ErrorResponse(
        `User ${req.user.slug} is not authorized to make changes to resource ${user.slug}`,
        403
      )
    );
  }
  if (!newPassword && !currentPassword) {
    return next(new ErrorResponse(`no update details provided`, 404));
  }

  // Check current password
  const auth = await bcrypt.compare(currentPassword, user.password);

  if (!auth) {
    return next(new ErrorResponse("Password is incorrect", 401));
  }

  user.password = newPassword;
  console.log(user.password);
  await user.save();

  sendTokenResponse(user, 200, res);
});
// done
exports.getLoggedInUser = asyncHandler(async (req, res, next) => {
  const user = req.user
  res.status(200).json({ userMe: user });
});
// done
exports.getAllUsers = asyncHandler(async (req, res, next) => {
  res.status(200).json(res.advancedResults);
});
// done
exports.getAllUsersPublic = asyncHandler(async (req, res, next) => {
  res.status(200).json(res.advancedResults);
});
// done
exports.getCustomerOrAdminForPublic = asyncHandler(async (req, res, next) => {
  const userToRetrieve = req.params.userSlug;

  const user = await User.findById(userToRetrieve).select("-blockedUsers");

  res.status(200).json({ user });
});
// done
exports.getCustomerOrAdmin = asyncHandler(async (req, res, next) => {
  const currentUser = req.user; // Get the current user

  const userToRetrieve = req.params.userSlug;
  // Check if the user to be retrieved is in the blockedUsers array of the current user
  const isBlocked = currentUser.blockedUsers
    .includes(userToRetrieve)
    .select("-blockedUsers");

  if (isBlocked) {
    // If the user is blocked, return an error response or a message
    return res.status(403).json({ success: false, message: "User is blocked" });
  }

  const user = await User.findById(userToRetrieve).select("-blockedUsers");

  res.status(200).json({ user });
});

exports.getSiteOwner = asyncHandler(async (req, res, next) => {
  const siteOwner = await User.find({ role: "site-owner" });

  res.status(200).json({ siteOwner });
});
// done
exports.deleteUser = asyncHandler(async (req, res, next) => {
  if (req.user.slug !== req.params.userSlug && req.user.role !== "site-owner") {
    return next(
      new ErrorResponse(
        `User ${req.user.slug} is not authorized to make changes to resource ${req.params.slug}`,
        403
      )
    );
  }
  const userSlug = req.params.userSlug;
  if (req.user.image) {
    const userImage = req.resource.image;

    await deleteImage("users", userImage);
  }

  await User.deleteOne({ slug: userSlug });
  res.status(200).json({ success: true, msg: "deleted", token: null });
});
exports.getAllCustomers = asyncHandler(async (req, res, next) => {
  const customers = await User.find({ role: "customer" });
  res.status(200).json({ numberOfCustomers: customers.length, customers });
});
exports.getAllAdmins = asyncHandler(async (req, res, next) => {
  const admins = await User.find({ role: "admin" });
  res.status(200).json({ numberOfadmins: admins.length, admins });
});

// get token from model, create cookie and send response
const sendTokenResponse = async (user, statusCode, res) => {
  const token = await user.getSignedJwtToken();

  res.status(statusCode).json({
    success: true,
    token,
    user: user.slug,
  });
};

exports.blockUser = asyncHandler(async (req, res, next) => {
  const userToBlock = req.params.userSlug; // Get the ID of the user to be blocked
  const currentUser = req.user; // Get the current user

  if (currentUser.blockedUsers.includes(userToBlock)) {
    return next(
      new ErrorResponse(
        `user ${currentUser.slug} has already blocked user ${userToBlock}`,
        401
      )
    );
  }

  // Add the user's ID to the current user's blockedUsers array
  currentUser.blockedUsers.push(userToBlock);
  await currentUser.save();
  res.status(200).json({
    success: true,
    message: `User ${userToBlock}, blocked successfully`,
  });
});
exports.unblockUser = asyncHandler(async (req, res, next) => {
  const userSlugToBlock = req.params.userSlug; // Get the ID of the user to be blocked
  const currentUser = req.user; // Get the current user

  const userToBlock = await User.findOne({ slug: userSlugToBlock });
  if (!currentUser.blockedUsers.includes(userToBlock._id)) {
    return next(
      new ErrorResponse(
        `user ${currentUser._id} has not blocked user ${userSlugToBlock}`,
        401
      )
    );
  }

  // Add the user's ID to the current user's blockedUsers array
  currentUser.blockedUsers = currentUser.blockedUsers.filter(
    (userId) => userId.toString() !== userToBlock._id.toString()
  );
  await currentUser.save();
  res.status(200).json({
    success: true,
    message: `User ${userSlugToBlock}, unblocked successfully`,
  });
});
