// IMPORT PACKAGES
const User = require("../models/userModel");
const asyncErrorHandler = require("../utils/asyncErrorHandler");
const jwt = require("jsonwebtoken");
const CustomError = require("../utils/customError");
const util = require("util");
const sendEmail = require("../utils/email");
const crypto = require('crypto')

const signToken = (id) => {
  return jwt.sign({ id }, process.env.SECRET_STR, {
    expiresIn: process.env.EXPIRED_IN,
  });
};

const signup = asyncErrorHandler(async (req, res) => {
  const newUser = await User.create(req.body);

  const token = signToken(newUser._id);

  const options = {
    maxAge: process.env.EXPIRED_IN,
    httpOnly: true
  }

  if (process.env.NODE_ENV === 'production') {
    options.secure = true
  }

  res.cookie('jwt', token, options)

  user.password = undefined

  res.status(201).json({
    status: "success",
    data: {
      user: newUser,
    },
  });
});

const login = asyncErrorHandler(async (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;

  if (!email || !password) {
    const err = new CustomError(
      "Both email and password fields are required !",
      400,
    );
    return next(err);
  }

  const user = await User.findOne({ email }).select("+password");

  if (!user || !(await user.comparePasswords(password, user.password))) {
    const err = new CustomError("Incorrect email or password", 400);
    return next(err);
  }

  const token = signToken(user._id);

  res.status(200).json({
    status: "success",
    token,
    user,
  });
});

const protect = asyncErrorHandler(async (req, res, next) => {
  // 1. Read the token & check if exists
  const testToken = req.headers.authorization;

  let token;

  if (testToken && testToken.startsWith("Bearer")) {
    token = testToken.split(" ")[1];
  }

  if (!token) {
    return next(new CustomError("You are not logged in !", 401));
  }

  // 2. Validate the token
  const decodedToken = await util.promisify(jwt.verify)(
    token,
    process.env.SECRET_STR,
  );

  console.log(decodedToken);

  // 3. If user exists
  const user = await User.findById(decodedToken.id);

  if (!user) {
    return next(
      new CustomError("The user with that given token does not exist!", 401),
    );
  }

  // 4. If the user changed the password after the token was issued
  const isPswrdChanged = await user.isPasswordChanged(decodedToken.iat);
  if (isPswrdChanged) {
    return next(
      new CustomError(
        "The password has been changed recently, Please login again!",
        401,
      ),
    );
  }

  // 5. Allow user to access route
  req.user = user;
  next();
});

const restrict = (role) => {
  return (req, res, next) => {
    if (req.user.role !== role) {
      return next(
        new CustomError("You don't have permission to access this action", 403),
      );
    }
    next();
  };
};

const forgotPassword = asyncErrorHandler(async (req, res, next) => {
  // 1. Get the email from the user
  const user = await User.findOne({ email: req.body.email });

  if (!user) {
    next(new CustomError("We could not find user with the given email", 404));
  }

  // 2. Generate a random reset token
  const resetToken = user.createResetPasswordToken();
  user.save({ validateBeforeSave: false });

  // 3. Send the token back to the user email box

  const resetUrl = `${req.protocol}://${req.get("host")}/api/v1/users/resetPassword/${resetToken}`;
  const message = `We have received a password reset request, Please use the below link to reset your password\n${resetUrl}`;

  try {
    await sendEmail({
      email: user.email,
      subject: "Password reset request received",
      message,
    });
    res.status(200).json({
      status: "succeed",
      message: "Password reset link send to the user email",
    });
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetTokenExpires = undefined;
    user.save({ validateBeforeSave: false });

    return next(
      new CustomError(
        "There is an error sending password reset email, Please try again later",
        500,
      ),
    );
  }
});

const resetPassword = asyncErrorHandler(async (req, res, next) => {
  // 1. If the user exists with the given token & token ha snot expired
  const token = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");
  const user = await User.findOne({
    passwordResetToken: token,
    passwordResetTokenExpires: { $gt: Date.now() },
  });

  if (!user) {
    return next(new CustomError("Token is invalid or token has expired!", 400));
  }

  // 2. Resetting the user password
  user.password = req.body.password
  user.confirmPassword = req.body.confirmPassword
  user.passwordResetToken = undefined
  user.passwordResetTokenExpires = undefined
  user.passwordChangedAt = Date.now()

  user.save()

  // 3. Login the user
  const loginToken = signToken(user._id);

  res.status(200).json({
    status: "success",
    token: loginToken,
    user,
  });
});

module.exports = {
  signup,
  login,
  protect,
  restrict,
  forgotPassword,
  resetPassword,
};
