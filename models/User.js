const { isEmail } = require("validator");
const mongoose = require("mongoose");



const UserSchema = new mongoose.Schema(
  {
    firstname: {
      type: String,
      required: true,
    },
    lastName: {
      type: String,
      required: true,
    },
    image: {
      type: String,
    },
    email: {
      type: String,
      required: [true, "Please add an email"],
      unique: true,
      validate: [isEmail, "Please use a valid URL with HTTP or HTTPS"],
    },
    password: {
      type: String,
      required: [true, "password is required"],
      minlength: [6, "password should be at least 6 characters"],
      select: false,
    },
    role: {
      type: String,
      enum: ["user", "admin", "site-owner"],
      default: "user",
    },
    wishlist: {
      type: Array,
    },
    resetPasswordToken: String,
    resetPasswordExpire: Date,
    verifyEmailOTP: String,
    verifyEmailOTPExpire: Date,
    verifiedStatus: {
      type: Boolean,
      enum: [true, false],
      default: false,
    },
  },
  { timestamps: true }
);



module.exports = mongoose.model("User", UserSchema);
