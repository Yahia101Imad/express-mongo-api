// IMPORT PACKAGES
const User = require("../models/userModel");
const asyncErrorHandler = require("../utils/asyncErrorHandler");

const signup = asyncErrorHandler(async (req, res) => {
    const newUser = await User.create(req.body)

    res.status(201).json({
        status: 'success',
        data: {
            user: newUser
        }
    })
})

module.exports = {signup}