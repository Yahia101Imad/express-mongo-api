// IMPORT PACKAGE
const bcrypt = require("bcrypt");
const mongoose = require("mongoose");
const validator = require("validator");

// name, email, password, confirm password, photo
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "User must have a name"],
    // trim: true,
    // minlength: [3, "Name must be at least 3 characters"],
    // maxlength: [30, "Name must be less than 30 characters"]
  },

  email: {
    type: String,
    required: [true, "User must have an email"],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, "Please provide a valid email"],
  },

  photo: {
    type: String,
    default: "default.jpg",
  },

  password: {
    type: String,
    required: [true, "Please provide a password"],
    minlength: [8, "Password must be at least 8 characters"],
    select: false,
  },

  confirmPassword: {
    type: String,
    required: [true, "Please confirm your password"],
    validate: {
      validator: function (val) {
        return this.password === val;
      },
      massage: "The password & the Confirm Password do not match!",
    },
  },
});

userSchema.pre("save", async function (next) {
if (!this.isModified("password")) return next();

  this.password = await bcrypt.hash(this.password, 8);
  this.confirmPassword = undefined;
});

userSchema.methods.comparePasswords = async function (pswrd, pswrdDB) {
  return await bcrypt.compare(pswrd, pswrdDB);
};

const User = mongoose.model("User", userSchema);

module.exports = User;
