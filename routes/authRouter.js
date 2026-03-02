// IMPORT PACKAGE
const express = require("express");
const { signup } = require("../controllers/authController");

// ROUTING
const router = express.Router();

router.post("/signup", signup);

// EXPORTS
module.exports = router;
