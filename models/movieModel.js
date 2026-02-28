// IMPORT PACKAGE
const mongoose = require("mongoose");
const fs = require("fs");
const validator = require("validator");

// SCHEMA
const movieSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minLength: [4, "The name field must not be below 4 characters"],
      maxLength: [100, "The name field must not be above 100 characters"],
      // validate: [validator.isAlpha, "The name should be alphabets only."],
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    duration: {
      type: Number,
      required: true,
      min: 0,
    },
    rating: {
      type: Number,
      required: true,
      // min: 0,
      // max: 10,
      validate: {
        validator: function (value) {
          return value >= 1 && value <= 10;
        },
      },
    },
    totalRating: {
      type: Number,
      default: 0,
      min: 0,
    },
    releaseYear: {
      type: Number,
      required: true,
    },
    releaseDate: {
      type: Date,
      // required: true,
      select: false,
    },
    genres: {
      type: [String],
      required: true,
    },
    directors: {
      type: [String],
      required: true,
    },
    coverImage: {
      type: String,
    },
    actors: {
      type: [String],
      required: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    createdBy: {
      type: String,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

movieSchema.virtual("durationInHours").get(function () {
  return this.duration / 60;
});

//**********************************************************MIDDLEWARE***********************************************************//

// 1. DOCUMENT MIDDLEWARE

// EXECUTED BEFORE THE DOCUMENT HAS SAVED IN DB
movieSchema.pre("save", function () {
  this.createdBy = "IMAD";
});

// EXECUTED AFTER THE DOCUMENT HAS SAVED IN DB
movieSchema.post("save", function (doc) {
  const content = `This movie is ${doc.name}, created by ${doc.createdBy}\r\n`;
  fs.writeFile("./log/log.txt", content, { flag: "a" }, (err) => {});
});

// 2. QUERY MIDDLEWARE

// EXECUTED BEFORE THE DOCUMENT HAS SAVED IN DB
movieSchema.pre(/^find/, function () {
  this.find({ releaseDate: { $lte: Date.now() } });
  this.startTime = Date.now();
});

// EXECUTED AFTER THE DOCUMENT HAS SAVED IN DB
movieSchema.post(/^find/, function (docs) {
  this.endTime = Date.now();
  const content = `This document takes ${this.endTime - this.startTime} milliseconds \r\n`;
  fs.writeFile("./log/log.txt", content, { flag: "a" }, (err) => {});
});

// 3.AGGREGATION MIDDLEWARE

// EXECUTED BEFORE THE DOCUMENT HAS SAVED IN DB
movieSchema.pre("aggregation", function () {
  this.pipeline().unshift({ releaseDate: { $lte: new Date() } });
});

//*******************************************************************************************************************************//

// MODEL
const Movie = mongoose.model("Movie", movieSchema);

module.exports = Movie;
