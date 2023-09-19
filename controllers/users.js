// get all users
// get single user - under user profile, show all recipes the user has, how the user email - if available
// add a user
const ErrorResponse = require("../utils/errorResponse");
const User = require("../models/User");
const asyncHandler = require("../middleware/async");
const { processImageFile, deleteImage } = require("../utils/imageFileUpload");

// done
exports.updateDetails = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.UserId);

  const name = req.body.name;
  const email = req.body.email;

  if (!name && !email && !req.files) {
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
  if (name) fieldsToUpdate.name = name;
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

// done
exports.updatePassword = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.UserId).select("+password");

  if (user.id !== req.user.id) {
    return next(
      new ErrorResponse(
        `User ${req.user._id} is not authorized to make changes to resource ${user._id}`,
        403
      )
    );
  }

  // Check current password
  const auth = await bcrypt.compare(req.body.currentPassword, user.password);

  if (!auth) {
    return next(new ErrorResponse("Password is incorrect", 401));
  }

  user.password = req.body.newPassword;
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
  const users = await User.find();

  res.status(200).json({ numberOfUsers: users.length, users });
});
// done
exports.getUser = asyncHandler(async (req, res, next) => {
  const userId = req.params.UserId;
  const user = await User.findById(userId);
  if (user.role === "site-owner" && user.role === req.user) {
    next();
  } else {
    return next(new ErrorResponse("not authorized to access this route", 401));
  }

  res.status(200).json({ user });
});
// done
exports.deleteUser = asyncHandler(async (req, res, next) => {
  if (req.user.id.toString() !== req.params.UserId) {
    return next(
      new ErrorResponse(
        `User ${req.user._id} is not authorized to make changes to resource ${req.params.UserId}`,
        403
      )
    );
  }
  const userId = req.params.UserId;

  const userImage = req.resource.image;

  await deleteImage("users", userImage);

  await User.deleteOne({ _id: userId });
  res.status(200).json({ success: true, msg: "deleted" });
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
exports.getAllCustomers = asyncHandler(async (req, res, next) => {
  const customers = await User.find({ role: "customer" });
  res.status(200).json({ numberOfCustomers: customers.length, customers });
});
exports.getAllAdmins = asyncHandler(async (req, res, next) => {
  const admins = await User.find({ role: "admin" });
  res.status(200).json({ numberOfadmins: admins.length, admins });
  res.status(200).json({ user });
});
