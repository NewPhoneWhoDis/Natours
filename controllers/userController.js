const User = require('../models/usersSchema');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const factory = require('./handlerFactory');

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

// Middleware for /me, basically getting the params form the incoming req and assigning to the user id
exports.getMe = (req, res, next) => {
    req.params.id = req.user.id;
    next();
}

//* Updating the currently authenticated user! 
exports.updateMe = catchAsync(async (req, res, next) => {
    // Create error if the user posts password because we use this only for data
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

exports.createUser = (req, res) => {
    res.status(500).json({
        status: 'error',
        message: 'This route is not defined! Please use /signup instead!'
    });
};

exports.getUser = factory.getOne(User);

exports.getAllUsers = factory.getAll(User);

//* Admin access 
exports.updateUser = factory.updateOne(User);

exports.deleteUser = factory.deleteOne(User);