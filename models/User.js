const { isEmail } = require("validator");
const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
  {
    firstname: {
      type: String,
      required: [true, "please enter a first name"],
    },
    lastName: {
      type: String,
      required: [true, "please enter a last name"],
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
    },
    wishlist: {
      type: Array,
    },
    address: {
      type: String,
    },
    phone: {
      type: String,
      required: [true, "please add a phone number"],
      validate: {
        validator: function (value) {
          const phoneRegex = /^(?:\+234|0)[789]\d{9}$/;
          return phoneRegex.test(value);
        },
        message: "Invalid Nigerian phone number",
      },
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
