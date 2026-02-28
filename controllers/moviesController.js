// IMPORT PACKAGES
const Movie = require("../models/movieModel");
const apiFeatures = require("../utils/apiFeatures");
const asyncErrorHandler = require("../utils/asyncErrorHandler");
const CustomError = require("../utils/customError");

// ROUTE HANDLER FUNCTIONS

const getHighestRated = (req, res, next) => {
  req.query.limit = "3";
  req.query.sort = "-rating";
  next();
};

const getAllMovies = asyncErrorHandler(async (req, res) => {
  // CLASS API FEATURES
  const features = new apiFeatures(Movie.find(), req.query)
    .filter()
    .sort()
    .select()
    .paginate();
  let movies = await features.query;

  // EXCLUDED FIELDS
  const queryObj = { ...req.query };
  const excludedFields = ["page", "sort", "limit", "fields"];
  excludedFields.forEach((el) => delete queryObj[el]);

  res.status(200).json({
    status: "succeed",
    length: movies.length,
    data: {
      movies,
    },
  });
});

const getMovie = asyncErrorHandler(async (req, res, next) => {
  // const movie = await Movie.find({_id: req.params.id});
  const movie = await Movie.findById(req.params.id);

  if (!movie) {
    const err = new CustomError(
      `Movie with this id: '${req.params.id}' is not found!`,
    );
    return next(err);
  }

  res.status(200).json({
    status: "succeed",
    data: {
      movie,
    },
  });
});

const postMovie = asyncErrorHandler(async (req, res) => {
  const movie = await Movie.create(req.body);
  res.status(201).json({
    status: "succeed",
    data: {
      movie,
    },
  });
});

const patchMovie = asyncErrorHandler(async (req, res, next) => {
  const updatedMovie = await Movie.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!updatedMovie) {
    const err = new CustomError(
      `Movie with this id: '${req.params.id}' is not found!`,
    );
    return next(err);
  }

  res.status(200).json({
    status: "succeed",
    data: {
      movie: updatedMovie,
    },
  });
});

const deleteMovie = asyncErrorHandler(async (req, res) => {
  const deletedMovie = await Movie.findByIdAndDelete(req.params.id);

  if (!deletedMovie) {
    const err = new CustomError(
      `Movie with this id: '${req.params.id}' is not found!`,
    );
    return next(err);
  }

  res.status(204).json({
    status: "succeed",
    data: null,
  });
});

const getMovieStats = asyncErrorHandler(async (req, res) => {
  const stats = await Movie.aggregate([
    { $match: { rating: { $gte: 5 } } },
    {
      $group: {
        _id: null,
        avgRating: { $avg: "$rating" },
        maxDuration: { $max: "$duration" },
        minPrice: { $min: "$price" },
        sumPrice: { $sum: "$price" },
        movieCount: { $sum: 1 },
      },
    },
    { $sort: { minPrice: 1 } },
    { $match: { maxPrice: { $gte: 15 } } },
  ]);
  res.status(200).json({
    status: "succeed",
    count: stats.length,
    data: { stats },
  });
});

const getMoviesByGenre = asyncErrorHandler(async (req, res) => {
  const genre = req.params.genre;
  const movies = await Movie.aggregate([
    { $unwind: "$genres" },
    {
      $group: {
        _id: "$genres",
        movieCount: { $sum: 1 },
        movies: { $push: "$name" },
      },
    },
    { $addFields: { genre: "$_id" } },
    { $project: { _id: 0 } },
    { $match: { genre: genre } },
  ]);
  res.status(200).json({
    status: "succeed",
    count: movies.length,
    data: { movies },
  });
});

module.exports = {
  getAllMovies,
  getMovie,
  postMovie,
  patchMovie,
  deleteMovie,
  getHighestRated,
  getMovieStats,
  getMoviesByGenre,
};
