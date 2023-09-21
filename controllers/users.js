// get all users
// get single user - under user profile, show all recipes the user has, how the user email - if available
// add a user
const ErrorResponse = require("../utils/errorResponse");
const User = require("../models/User");
const asyncHandler = require("../middleware/async");
const { processImageFile, deleteImage } = require("../utils/imageFileUpload");
const bcrypt = require("bcryptjs");

exports.updateDetails = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.UserId);

  const firstname = req.body.firstname;
  const lastname = req.body.lastname;
  const email = req.body.email;

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
  const user = await User.findById(req.params.UserId);
  if (user.id !== req.user.id) {
    return next(
      new ErrorResponse(
        `User ${req.user._id} is not authorized to make changes to resource ${user._id}`,
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

  const user = await User.findById(req.params.UserId).select("+password");

  if (user.id !== req.user.id) {
    return next(
      new ErrorResponse(
        `User ${req.user._id} is not authorized to make changes to resource ${user._id}`,
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
  const user = await User.findById(req.user.id);
  res.status(200).json({ userMe: user });
});
// done
exports.getAllUsers = asyncHandler(async (req, res, next) => {
  const users = await User.find({
    _id: { $nin: req.user.blockedUsers },
  }).select("-blockedUsers");

  res.status(200).json({ numberOfUsers: users.length, users });
});
// done
exports.getAllUsersPublic = asyncHandler(async (req, res, next) => {
  const users = await User.find().select("-blockedUsers");

  res.status(200).json({ numberOfUsers: users.length, users });
});
// done
exports.getCustomerOrAdminForPublic = asyncHandler(async (req, res, next) => {
  const userIdToRetrieve = req.params.UserId;

  const user = await User.findById(userIdToRetrieve).select("-blockedUsers");

  res.status(200).json({ user });
});
// done
exports.getCustomerOrAdmin = asyncHandler(async (req, res, next) => {
  const currentUser = req.user; // Get the current user

  const userIdToRetrieve = req.params.UserId;
  // Check if the user to be retrieved is in the blockedUsers array of the current user
  const isBlocked = currentUser.blockedUsers
    .includes(userIdToRetrieve)
    .select("-blockedUsers");

  if (isBlocked) {
    // If the user is blocked, return an error response or a message
    return res.status(403).json({ success: false, message: "User is blocked" });
  }

  const user = await User.findById(userIdToRetrieve).select("-blockedUsers");

  res.status(200).json({ user });
});

exports.getSiteOwner = asyncHandler(async (req, res, next) => {
  const siteOwner = await User.find({ role: "site-owner" });

  res.status(200).json({ siteOwner });
});
// done
exports.deleteUser = asyncHandler(async (req, res, next) => {
  if (
    req.user.id.toString() !== req.params.UserId &&
    req.user.role !== "site-owner"
  ) {
    return next(
      new ErrorResponse(
        `User ${req.user._id} is not authorized to make changes to resource ${req.params.UserId}`,
        403
      )
    );
  }
  const userId = req.params.UserId;
  if (req.user.image) {
    const userImage = req.resource.image;

    await deleteImage("users", userImage);
  }

  await User.deleteOne({ _id: userId });
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
    user: user._id,
  });
};

exports.blockUser = asyncHandler(async (req, res, next) => {
  const userIdToBlock = req.params.UserId; // Get the ID of the user to be blocked
  const currentUser = req.user; // Get the current user

  if (currentUser.blockedUsers.includes(userIdToBlock)) {
    return next(
      new ErrorResponse(
        `user ${currentUser._id} has already blocked user ${userIdToBlock}`,
        401
      )
    );
  }

  // Add the user's ID to the current user's blockedUsers array
  currentUser.blockedUsers.push(userIdToBlock);
  await currentUser.save();
  console.log(currentUser);
  res.status(200).json({
    success: true,
    message: `User ${userIdToBlock}, blocked successfully`,
  });
});
exports.unblockUser = asyncHandler(async (req, res, next) => {
  const userIdToUnblock = req.params.UserId; // Get the ID of the user to be blocked
  const currentUser = req.user; // Get the current user

  if (!currentUser.blockedUsers.includes(userIdToUnblock)) {
    return next(
      new ErrorResponse(
        `user ${currentUser._id} has not blocked user ${userIdToUnblock}`,
        401
      )
    );
  }

  // Add the user's ID to the current user's blockedUsers array
  currentUser.blockedUsers = currentUser.blockedUsers.filter(
    (userId) => userId.toString() !== userIdToUnblock
  );
  await currentUser.save();
  res.status(200).json({
    success: true,
    message: `User ${userIdToUnblock}, unblocked successfully`,
  });
});

