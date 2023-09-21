const asyncHandler = require("../middleware/async");
const User = require("../models/User");

const ErrorResponse = require("../utils/errorResponse");
const { processImageFile } = require("../utils/imageFileUpload");
const sendEmail = require('../utils/sendEmail');
const crypto = require("crypto");

// POST /api/auth/signup: User registration.
exports.signup = asyncHandler(async (req, res, next) => {
  let sanitizedImageName;
  const { email, password, firstname, lastname } = req.body;

  if (req.files && req.files.image) {
    sanitizedImageName = await processImageFile(req, res, next, "users");
  }

  const user = await User.create({
    image: sanitizedImageName,
    email,
    password,
    firstname,
    lastname,
    verifiedStatus: false,
  });

  await user.getVerifyEmailOTP(user.email, next);

  if (!user.verifyEmailOTP) {
    message =
      "user signed up. please request an otp be sent to you to verify email";
  } else {
    message = "user signed up, please check email sent to you and verify email";
  }

  sendTokenResponse(user, 200, res, message);
});
// POST /api/auth/login: User login.
exports.login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;
  const user = await User.login(email, password, next);

  sendTokenResponse(user, 200, res);
});
// POST /api/auth/verify-email verify email of registered user by otp
exports.verifyEmail = asyncHandler(async (req, res, next) => {
  const { email, userEnteredOTP } = req.body;
  const user = await User.findOne({
    email,
    verifiedStatus: false,
    verifyEmailOTP: userEnteredOTP,
    verifyEmailOTPExpire: { $gt: Date.now() },
  });

  if (!user) {
    // User not found or OTP data is missing
    return next(new ErrorResponse("Invalid Token", 400));
  }

  await user.verifyEmail(user, res);
});
// POST /api/auth/resend-otp: incase of an error when sending the first otp to verify email
exports.resendVerifyEmailOTP = asyncHandler(async (req, res, next) => {
  const user = req.user;
  console.log(user);
  if (!user) {
    return next(
      new ErrorResponse(`not authenticated to make a new otp request`, 403)
    );
  }
  await user.getVerifyEmailOTP(user.email);

  res.status(200).json({
    sucess: "true",
    message: `new otp has been sent to ${user.email}`,
  });
});
exports.logout = asyncHandler(async (req, res, next) => {
  // set the token to null so user has to login to receive another token
  res.status(200).json({ message: "Logout successful", token: null });
});

exports.forgotPassword = asyncHandler(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });

  if (!user) {
    return next(new ErrorResponse("there is no user with that email", 404));
  }

  const resetToken = await user.getResetPasswordToken();

  await user.save({ validateBeforeSave: false });

  // create reset url
  const resetURL = `${req.protocol}://${req.get(
    "host"
  )}/api/v1/users/reset-password/${resetToken}`;

  const message = `You are receiving this email because you need to confirm your email address. Please make a GET request to: \n\n ${resetURL}`;

  try {
    await sendEmail({
      email: user.email,
      subject: "Password reset token",
      message,
    }),
      process.env.FROM_NAME,
      process.env.FROM_EMAIL;
  } catch (err) {
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
console.log(err)
    await user.save({ validateBeforeSave: false });
    return next(new ErrorResponse("Email could not be sent"));
  }
  res.status(201).json({
    success: true,
    message: "email sent",
    resetToken,
  });
});

// done
exports.resetPassword = asyncHandler(async (req, res, next) => {
  // get hashed token
  const resetPasswordToken = crypto
    .createHash("sha256")
    .update(req.params.resetToken)
    .digest("hex");

  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpire: { $gt: Date.now() },
  });

  if (!user) {
    return next(new ErrorResponse("Invalid token", 400));
  }

  // set the new password
  user.password = req.body.password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;

  await user.save();

  sendTokenResponse(user, 200, res);
});

const sendTokenResponse = async (user, statusCode, res, message) => {
  const token = await user.getSignedJwtToken();

  res.status(statusCode).json({
    success: true,
    token,
    user: user._id,
    message,
  });
};
