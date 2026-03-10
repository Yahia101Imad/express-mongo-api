// IMPORT PACKAGES
const User = require("../models/userModel");
const asyncErrorHandler = require("../utils/asyncErrorHandler");
const CustomError = require("../utils/customError");

const getAllUsers = asyncErrorHandler(async (req, res, next) => {
  const users = await User.find();

  res.status(200).json({
    status: "succeed",
    results: users.length,
    data: { users },
  });
});

const filterReqObj = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach((prop) => {
    if (allowedFields.includes(prop)) newObj[prop] = obj[prop];
  });
  return newObj;
};

const updatePassword = asyncErrorHandler(async (req, res, next) => {
  // 1. Get current user data from database
  const user = await User.findOne(req.user._id).select("+password");

  // 2. Check if the supplied current password is correct
  if (
    !(await user.comparePasswordInDB(req.body.currentPassword, user.password))
  ) {
    return next(
      new CustomError("This password you provided is not wrong", 400),
    );
  }

  // 3. If the supplied password is true, change the current password
  user.password = req.body.password;
  user.confirmPassword = req.body.confirmPassword;

  await user.save();

  // 4. Login user & send JWT
  const token = signToken(user._id);
  res.status(200).json({
    status: "succeed",
    token,
    data: {
      user,
    },
  });
});

const updateMe = asyncErrorHandler(async (req, res, next) => {
  // 1. Check if the req data contains password or confirm password
  if (req.body.password || req.body.confirmPassword) {
    return next(
      new CustomError("You can't update your password in this endpoint", 400),
    );
  }

  // 2. Update user details
  const filterObj = filterReqObj(req.body, "name", "email");
  const updatedUser = await User.findOneAndUpdate(req.user.id, filterObj, {
    runValidators: true,
    new: true,
  });

  res.status(200).json({
    status: "succeed",
    token,
    data: {
      user: updatedUser,
    },
  });
});

const deleteMe = asyncErrorHandler(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user.id, { active: false });

  res.status(200).json({
    status: "succeed",
    data: null,
  });
});

module.exports = { updatePassword, updateMe, deleteMe, getAllUsers };
