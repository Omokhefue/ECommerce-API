const { isEmail } = require("validator");
const mongoose = require("mongoose");
const slugify = require("slugify");

const bcrypt = require("bcryptjs");
const crypto = require("crypto");
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
    lastname: {
      type: String,
      required: [true, "please enter a last name"],
    },
    fullUsername: String,
    slug: {
      type: String,
      unique: true, // Ensure that slugs are unique
      // required: true,
    },
    slugCounter: {
      type: Number,
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
      enum: ["customer", "admin", "site-owner"],
      default: "customer",
      required: true,
    },
    wishlist: {
      type: Array,
    },
    address: {
      type: String,
    },
    phone: {
      type: String,
      validate: {
        validator: function (value) {
          const phoneRegex = /^(?:\+234|0)[789]\d{9}$/;
          return phoneRegex.test(value);
        },
        message: "Invalid Nigerian phone number",
      },
    },
    blockedUsers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
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
  // Declare and initialize the slug variable
  let slug = "";
  this.fullUsername = `${this.firstname} ${this.lastname}`;

  // Check if the firstname, lastname, or password has been modified, or if the document is new
  if (
    this.isModified("firstname") ||
    this.isModified("lastname") ||
    this.isNew
  ) {
    const existingUser = await this.constructor.findOne(
      { fullUsername: this.fullUsername }, // Filter by fullUsername
      {}, // Projection (empty to return all fields)
      { sort: { slugCounter: -1 } } // Sort by slugCounter in descending order
    );

    if (existingUser) {
      // Increment the counter
      this.slugCounter = existingUser.slugCounter + 1;
    } else {
      // Initialize the counter
      this.slugCounter = 1;
    }

    // Generate the slug by joining fullUsername and counter
    const fullUsernameWithCounter = `${this.fullUsername} ${this.slugCounter}`;
    slug = slugify(fullUsernameWithCounter, {
      lower: true,
      remove: /[*+~.()'"!:@]/g,
    });
    this.slug = slug;
  }

  if (this.isNew || this.isModified("password")) {
    // Hash the password
    const salt = bcrypt.genSaltSync(10);
    this.password = bcrypt.hashSync(this.password, salt);
  }

  next();
});

UserSchema.statics.login = async function (email, password, next) {
  if (!email || !password) {
    return next(new ErrorResponse("Please provide an email and password", 400));
  }
  const user = await this.findOne({ email }).select("+password");

  if (!user) {
    throw new ErrorResponse("Invalid Credentials", 401);
  }

  const auth = await bcrypt.compare(password, user.password);

  if (auth) {
    return user;
  } else {
    throw new ErrorResponse("Invalid Credentials", 401);
  }
};

UserSchema.methods.getSignedJwtToken = async function () {
  return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE,
  });
};

UserSchema.methods.getVerifyEmailOTP = async function (email, next) {
  if (this.verifiedStatus) {
    throw new ErrorResponse(`user ${this._id} is already verified`);
  }
  const otp = otpGenerator.generate(6, {
    upperCase: false,
    specialChars: false,
  });

  this.verifyEmailOTP = otp;
  this.verifyEmailOTPExpire = Date.now() + 10 * 60 * 1000;

  await this.save({ validateBeforeSave: false });

  const message = `An OTP has been sent to you . \n please input the OTP you recieved into the box below. \n ${otp} `;

  try {
    await sendEmail(
      {
        email,
        subject: `OTP from ${process.env.FROM_NAME}`,
        message,
      },
      process.env.FROM_NAME,
      process.env.FROM_EMAIL
    );
  } catch (err) {
    this.verifyEmailOTP = undefined;
    this.verifyEmailOTPExpire = undefined;
    await this.save({ validateBeforeSave: false });
  }
  // ask chat gpt
};

UserSchema.methods.verifyEmail = async function (user, res) {
  // OTP is valid and within the timeout window
  user.verifyEmailOTP = undefined;
  user.verifyEmailOTPExpire = undefined;
  user.verifiedStatus = true;
  await user.save({ validateBeforeSave: false }); // Save changes to the user
  return res
    .status(200)
    .json({ success: true, message: "OTP verified successfully" });
};

// Generate and hash password Token
UserSchema.methods.getResetPasswordToken = async function () {
  const resetToken = crypto.randomBytes(20).toString("hex");

  this.resetPasswordToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  this.resetPasswordExpire = Date.now() + 10 * 60 * 1000;

  return resetToken;
};
// UserSchema.pre("deleteOne", async () => {
//   await Product.deleteMany({ user: this._id });
//   await Review.deleteMany({ user: this._id });
//   await Cart.deleteMany({ user: this._id });
//   await Order.deleteMany({ user: this._id });
module.exports = mongoose.model("User", UserSchema);
