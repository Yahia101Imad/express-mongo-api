// IMPORT PACKAGES
const Movie = require("../models/movieModel");
const apiFeatures = require("../utils/apiFeatures");

// ROUTE HANDLER FUNCTIONS

const getHighestRated = (req, res, next) => {
  req.query.limit = "3";
  req.query.sort = "-rating";
  next();
};

const getAllMovies = async (req, res) => {
  try {
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
  } catch (err) {
    res.status(400).json({
      status: "fail",
      message: err.message,
    });
  }
};

const getMovie = async (req, res) => {
  try {
    // const movie = await Movie.find({_id: req.params.id});
    const movie = await Movie.findById(req.params.id);
    res.status(200).json({
      status: "succeed",
      data: {
        movie,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: "fail",
      message: err.message,
    });
  }
};

const postMovie = async (req, res) => {
  try {
    const movie = await Movie.create(req.body);
    res.status(201).json({
      status: "succeed",
      data: {
        movie,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: "fail",
      message: err.message,
    });
  }
};

const patchMovie = async (req, res) => {
  try {
    const updatedMovie = await Movie.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true },
    );
    res.status(200).json({
      status: "succeed",
      data: {
        movie: updatedMovie,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: "fail",
      message: err.message,
    });
  }
};

const deleteMovie = async (req, res) => {
  try {
    await Movie.findByIdAndDelete(req.params.id);
    res.status(204).json({
      status: "succeed",
      data: null,
    });
  } catch (err) {
    res.status(400).json({
      status: "fail",
      message: err.message,
    });
  }
};

const getMovieStats = async (req, res) => {
  try {
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
  } catch (err) {
    res.status(400).json({
      status: "fail",
      message: err.message,
    });
  }
};

const getMoviesByGenre = async (req, res) => {
  try {
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
  } catch (err) {
    res.status(400).json({
      status: "fail",
      message: err.message,
    });
  }
};

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
