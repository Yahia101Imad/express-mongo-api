// IMPORT PACKAGE
const express = require("express");
const app = express();
const morgan = require("morgan");
const moviesRouter = require("./routes/moviesRouter");
const globalErrorHandler = require("./controllers/errorController");
const CustomError = require("./utils/customError");
const authRouter = require("./routes/authRouter");
const userRouter = require("./routes/userRouter");

// SETTING THE QUERY PARSER
app.set("query parser", "extended");

// MIDDLEWARE
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

app.use(express.json());
app.use((req, res, next) => {
  req.requestedAT = new Date().toISOString();
  next();
});
app.use(express.static("./public"));

// USING ROUTES
app.use("/api/v1/movies", moviesRouter);
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/user", userRouter);
app.use((req, res, next) => {
  // METHOD 01
  // res.status(404).json({
  //   status: 'fail',
  //   message: `Can't find ${req.originalUrl} in the server!`
  // })

  // METHOD 02
  // const err = new Error(`Can't find ${req.originalUrl} in the server!`)
  // err.status = 'fail'
  // err.statusCode = 404

  // METHOD 03
  const err = new CustomError(
    `Can't find ${req.originalUrl} in the server!`,
    404,
  );

  next(err);
});

app.use(globalErrorHandler);

module.exports = app;
