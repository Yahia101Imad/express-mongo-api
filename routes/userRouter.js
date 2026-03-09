// IMPORT PACKAGE
const express = require("express");
const { protect } = require("../controllers/authController");
const {updatePassword, updateMe} = require('../controllers/userController')

// ROUTING
const router = express.Router();

router.patch("/updatePassword",protect, updatePassword);
router.patch("/updateMe",protect, updateMe);

// EXPORTS
module.exports = router;