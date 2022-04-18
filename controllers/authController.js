const catchAsync = require('../utils/catchAsync');
const User = require('./../models/usersSchema');
const jwt = require('jsonwebtoken');

exports.signup = catchAsync(async (req, res, next) => {
    /* //* Security flaw:
    Anyone can specify the role as admin and register as an admin
    const newUser = await User.create(req.body);
    */
    const newUser = await User.create({
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
        passwordConfirm: req.body.passwordConfirm
    });

    const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN
    });

    res.status(201).json({ status: 'succes', token, data: { user: newUser } });
})