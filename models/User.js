const { isEmail } = require("validator");
const mongoose = require("mongoose");

const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const otpGenerator = require("otp-generator");
const sendEmail = require("../utils/sendEmail");
const ErrorResponse = require("../utils/errorResponse");

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

UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    next();
  }
  const salt = bcrypt.genSaltSync(10);
  this.password = bcrypt.hashSync(this.password, salt);
});

UserSchema.methods.getSignedJwtToken = async function () {
  return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE,
  });
};

UserSchema.methods.getVerifyEmailOTP = async function (email, res) {
  if (this.verifiedStatus) {
    throw new ErrorResponse(`user ${this._id} is already verified`);
  }
  const otp = otpGenerator.generate(6, {
    upperCase: false,
    specialChars: false,
  });

  this.verifyEmailOTP = otp;
  this.verifyEmailOTPExpire = Date.now() + 1 * 60 * 1000;

  await this.save({ validateBeforeSave: false });

  const message = `An OTP has been sent to you . \n please input the OTP you recieved into the box below. \n ${otp} `;

  try {
    await sendEmail({
      email,
      subject: "OTP from OmoFoodsAndCo",
      message,
    });
  } catch (err) {
    this.verifyEmailOTP = undefined;
    this.verifyEmailOTPExpireExpire = undefined;
    res.redirect("/resend-OTP");
    throw new ErrorResponse("Email could not be sent");
  }
};

UserSchema.methods.verifyEmail = async function (user, userEnteredOTP, res) {
  const currentTime = Date.now();
  const elapsedTime = currentTime - user.verifyEmailOTPExpire;

  if (
    elapsedTime <= user.verifyEmailOTPExpire &&
    user.verifyEmailOTP === userEnteredOTP
  ) {
    // OTP is valid and within the timeout window
    user.verifyEmailOTP = undefined;
    user.verifyEmailOTPExpire = undefined;
    user.verifiedStatus = true;
    await user.save(); // Save changes to the user
    return res
      .status(200)
      .json({ success: true, message: "OTP verified successfully" });
  } else {
    // OTP is either expired or incorrect
    throw new ErrorResponse("Invalid Token", 400);
  }
};
module.exports = mongoose.model("User", UserSchema);
