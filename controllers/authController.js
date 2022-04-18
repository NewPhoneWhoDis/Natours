const catchAsync = require('../utils/catchAsync');
const User = require('./../models/usersSchema');
const jwt = require('jsonwebtoken');
const AppError = require('./../utils/appError');
const { promisify } = require('util');

const signToken = id => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN
    });
}

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

    const token = signToken(newUser._id);

    res.status(201).json({ status: 'succes', token, data: { user: newUser } });
});

exports.login = catchAsync(async (req, res, next) => {
    const { email } = req.body;
    const { password } = req.body;
    const user = await User.findOne({ email: email }).select('+password');

    if (!email || !password) {
        return next(new AppError('Please provide a password and an email!', 400));
    }

    if (!correct || !(await user.correctPassword(password, user.password))) {
        return next(new AppError('Wrong email or password!', 401));
    }

    const token = signToken(user._id);

    res.status(201).json({ status: 'succes', token });
});

exports.protect = catchAsync(async (req, res, next) => {
    // getting token and checking is it's there
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
        return next(new AppError('Your are not logged in! Please log in to get access.', 401));
    }

    // The Verification Token
    const decodedData = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

    // Checks if the user still exists
    const currentUser = await User.findById(decodedData.id);
    if (!currentUser) {
        return next(new AppError('The user belonging to this token does no longer exist.', 401));
    }

    // Checks if the user changed password after the token was issued, iat = issued at
    if (currentUser.changedPasswordAfter(decodedData.iat)) {
        return next(new AppError('Password has been recently changed! Please log in again.', 401));
    }

    // Gaining access to the route
    req.user = currentUser;
    next();
})