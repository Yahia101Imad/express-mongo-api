// IMPORT PACKAGE
const express = require("express");
const {
  getAllMovies,
  getMovie,
  postMovie,
  patchMovie,
  deleteMovie,
  getHighestRated,
  getMovieStats,
  getMoviesByGenre
} = require("../controllers/moviesController");

// ROUTING
const moviesRouter = express.Router();

// TODO: THIS ROUTE DOES NOT WORK !
moviesRouter.route("/highest-rated").get(getHighestRated, getAllMovies);

moviesRouter.route("/movie-stats").get(getMovieStats);

moviesRouter.route("/movies-by-genre/:genre").get(getMoviesByGenre);

moviesRouter.route("/").get(getAllMovies).post(postMovie);
moviesRouter.route("/:id").get(getMovie).patch(patchMovie).delete(deleteMovie);

// EXPORTS
module.exports = moviesRouter;
