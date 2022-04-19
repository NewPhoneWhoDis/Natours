const User = require('../models/usersSchema');
const APIFeatures = require('../utils/apiFeatures');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

// Creates arr of the elements that are allowed in
const filterObj = (obj, ...allowedFields) => {
    const newObject = {};
    Object.keys(obj).forEach(el => {
        if (allowedFields.includes(el)) {
            newObject[el] = obj[el];
        }
    })

    return newObject;
}

exports.getAllUsers = catchAsync(async (req, res, next) => {
    const users = await User.find();

    res.status(200).json({ status: 'success', results: users.length, data: { users } });
});

//* Updating the currently authenticated user! 
exports.updateMe = catchAsync(async (req, res, next) => {
    // Create error if the user posts password data because we use this only for data
    if (req.body.password || req.body.passwordConfirm) {
        return next(new AppError('Password update is forbidden on this route! Use: /updateMyPassword', 400));
    }

    //* filteredBody because I don't want to update everything in req.body. Example: User can put role 'admin' into 
    //* the req.body and override his role
    const filteredBody = filterObj(req.body, 'name', 'email');

    // Updating the user doc
    // new:true in order to return the new doc
    const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, { new: true, runValidators: true });

    res.status(200).json({ status: 'success', data: { user: updatedUser } });
});

exports.deleteMe = catchAsync(async (req, res, next) => {
    await User.findByIdAndDelete(req.body.id, { active: false });

    res.status(204).json({ status: 'success', data: null });
});

exports.getUser = (req, res) => {
    res.status(500).json({
        status: 'error',
        message: 'This route is not yet defined!'
    });
};
exports.createUser = (req, res) => {
    res.status(500).json({
        status: 'error',
        message: 'This route is not yet defined!'
    });
};

//* Admin access
exports.updateUser = (req, res) => {
    res.status(500).json({
        status: 'error',
        message: 'This route is not yet defined!'
    });
};
exports.deleteUser = (req, res) => {
    res.status(500).json({
        status: 'error',
        message: 'This route is not yet defined!'
    });
};