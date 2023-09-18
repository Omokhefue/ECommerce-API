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

  await user.getVerifyEmailOTP(user.email, res);

  sendTokenResponse(user, 200, res);
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

  await user.verifyEmail(user, userEnteredOTP, res);
});
// POST /api/auth/resend-otp: incase of an error when sending the first otp to verify email
exports.resendVerifyEmailOTP = asyncHandler(async (req, res, next) => {
  const user = req.user;
  await user.getVerifyEmailOTP(user.email);
  res.status(200).json({ sucess: "true", message: "new otp has been sent" });
});
exports.logout = asyncHandler(async (req, res, next) => {
  res.status(200).json({ message: "Logout successful" });
});
const sendTokenResponse = async (user, statusCode, res) => {
  const token = await user.getSignedJwtToken();

  res.status(statusCode).json({
    success: true,
    token,
    user: user._id,
  });
};

