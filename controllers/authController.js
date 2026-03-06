// IMPORT PACKAGES
const User = require("../models/userModel");
const asyncErrorHandler = require("../utils/asyncErrorHandler");
const jwt = require("jsonwebtoken");
const CustomError = require("../utils/customError");
const util = require("util");

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

  res.status(201).json({
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
    token = testToken.split(" ")[1]
  }

  if (!token) {
    return next(new CustomError("You are not logged in !", 401));
  }

  // 2. Validate the token
  const decodedToken = await util.promisify(jwt.verify)(token, process.env.SECRET_STR);

  console.log(decodedToken);

  // 3. If user exists

  // 4. If the user changed the password after the token was issued

  // 5. Allow user to access route

  next();
});

module.exports = { signup, login, protect };
