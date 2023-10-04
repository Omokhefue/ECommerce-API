const express = require("express");
const {
  signup,
  login,
  verifyEmail,
  resendVerifyEmailOTP,
  logout,
  forgotPassword,
  resetPassword
} = require("../controllers/auth");

const { protect } = require("../middleware/auth");

const router = express.Router();


router.post("/signup", signup); //done
router.post("/login", login); //done
router.post("/verify-email", protect, verifyEmail); //done
router.post("/resend-otp", protect, resendVerifyEmailOTP); //done
router.post("/forgot-password", protect, forgotPassword); //test route
router.post("/logout", protect, logout); //done
router.put("/reset-password/:resetToken", protect, resetPassword); //test route

module.exports = router;
