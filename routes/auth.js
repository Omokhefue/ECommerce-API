const express = require("express");
const {
  signup,
  login,
  verifyEmail,
  resendVerifyEmailOTP,
  logout,
} = require("../controllers/auth");

const { protect } = require("../middleware/auth");

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.post("/verify-email", protect, verifyEmail);
router.post("/resend-otp", protect, resendVerifyEmailOTP);
router.post("/logout", protect, logout);

module.exports = router;
