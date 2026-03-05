// IMPORT PACKAGES
const User = require("../models/userModel");
const asyncErrorHandler = require("../utils/asyncErrorHandler");
const jwt = require("jsonwebtoken");
const CustomErr = require("../utils/customError");

const signToken = (id) => {
  return jwt.sign({ id }, process.env.SECRET_STR, {
    expiresIn: process.env.EXPIRED_IN,
  });
};

const signup = asyncErrorHandler(async (req, res) => {
  const newUser = await User.create(req.body);

  const token = signToken(newUser._id);

  res.status(201).json({
    status: "success",
    token,
    data: {
      user: newUser,
    },
  });
});

const login = asyncErrorHandler(async (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;

  if (!email || !password) {
    const err = new CustomErr(
      "Both email and password fields are required !",
      400,
    );
    return next(err);
  }

  const user = await User.findOne({ email }).select("+password");

  if (!user || !(await user.comparePasswords(password, user.password))) {
    const err = new CustomErr("Incorrect email or password", 400);
    return next(err);
  }

  const token = signToken(user._id);

  res.status(201).json({
    status: "success",
    token,
    user,
  });
});

module.exports = { signup, login };
