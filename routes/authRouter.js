// IMPORT PACKAGE
const express = require("express");
const { signup, login } = require("../controllers/authController");

// ROUTING
const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);

// EXPORTS
module.exports = router;
