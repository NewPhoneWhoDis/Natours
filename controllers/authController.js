const catchAsync = require('../utils/catchAsync');
const User = require('./../models/usersSchema');
const jwt = require('jsonwebtoken');
const AppError = require('./../utils/appError');
const { promisify } = require('util');
const sendEmail = require('../utils/email');
const crypto = require('crypto');

const signToken = id => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN
    });
}

const createAndSendToken = (user, statusCode, res) => {
    const token = signToken(user._id);

    res.status(statusCode).json({ status: 'succes', token, data: { user } });
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

    createAndSendToken(newUser, 201, res);
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

    createAndSendToken(user, 200, res);
});

exports.protect = catchAsync(async (req, res, next) => {
    // getting token and checking is it's there
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
        return next(new AppError('You are not logged in! Please log in to get access.', 401));
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

exports.restrictTo = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return next(new AppError('You do not have permission to perform this action', 403));
        }

        next();
    };
};

exports.forgotPassword = catchAsync(async (req, res, next) => {
    //* Get user based on email
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
        return next(new AppError('There is no user with email address.', 404));
    }

    //* Generating random reset token
    const resetToken = user.createPasswordResetToken();
    await user.save({ validateBeforeSave: false });

    //* Sending it to the user's email
    const resetURL = `${req.protocol}://${req.get('host')}/api/v1/users/resetPassword/${resetToken}`;

    const message = `Forgot your password? Submit a PATCH request with your new password and passwordConfirm to: ${resetURL}.\nIf you didn't forget your password, please ignore this email!`;

    // In case of an Error reset both the token and the expires property
    try {
        await sendEmail({
            email: user.email,
            subject: 'Your password reset token (valid for 10 min)',
            message
        });

        res.status(200).json({ status: 'success', message: 'Token sent to email!' });
    } catch (err) {
        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined;
        await user.save({ validateBeforeSave: false });

        return next(new AppError('There was an error sending the email. Try again later!'), 500);
    }
});

exports.resetPassword = catchAsync(async (req, res, next) => {
    // Gets the user based on the token
    const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');

    const user = await User.findOne({
        passwordResetToken: hashedToken, passwordResetExpires: { $gte: Date.now() }
    });

    // If the token is not expired and there is a user, then set the new password
    if (!user) {
        return next(new AppError('Token is invalid or expired!', 400));
    }

    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    createAndSendToken(user, 200, res);
});

exports.updatePassword = catchAsync(async (req, res, next) => {
    // Getting user from the collection of users
    const user = await User.findById(req.user.id).select('+password');

    // Checking to see if the posted current password is correct. If it is, password will be updated.
    if (!(await user.correctPassword(req.body.passwordCurrent, user.password))) {
        return next(new AppError('Wrong password, please try again!', 401));
    }

    // Password update
    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;
    await user.save();

    // Send JWT
    createAndSendToken(user, 200, res);
})