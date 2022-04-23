const Tour = require('../models/toursSchema');
const AppError = require('./../utils/appError');
const catchAsync = require('./../utils/catchAsync');
const factory = require('./handlerFactory');

exports.getOverview = catchAsync(async (req, res, next) => {
    const tours = await Tour.find();

    res.status(200).render('overview', { title: 'All Tours', tours: tours });
})

exports.getTour = catchAsync(async (req, res, next) => {
    // 1) Getting the data for the requested tour, including reviews and guides
    const tour = await Tour.findOne({ slug: req.params.slug }).populate({
        path: 'reviews',
        fields: 'review rating user'
    });

    if (!tour) {
        return next(new AppError('There is no tour with that name.', 404));
    }

    // 2) Build template
    // 3) Render template using data from 1)
    res.status(200).render('tour', { title: `${tour.name} Tour`, tour });
});

exports.getLoginForum = (req, res) => {
    res.status(200).render('login', { title: 'Log into your account!' });
}

exports.getSignUpForum = (req, res) => {
    res.status(200).render('signup', { title: 'Create an acccount!' });
}