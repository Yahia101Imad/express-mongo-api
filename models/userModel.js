// IMPORT PACKAGE
const { hash } = require("bcrypt");
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
  },

  confirmPassword: {
    type: String,
    required: [true, "Please confirm your password"],
    validate: {
      validator: function (val) {
        return this.password === val;
      },
      massage: "The password & the Confirm Password is not match!",
    },
  },
});

userSchema.pre("save", async function () {
  if (!this.isModified("password")) return

  this.password = await hash(this.password, 8);
  this.confirmPassword = undefined;
});

const User = mongoose.model("User", userSchema);

module.exports = User;
