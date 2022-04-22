const Tour = require('../models/toursSchema');
const AppError = require('./../utils/appError');
const catchAsync = require('./../utils/catchAsync');
const factory = require('./handlerFactory');

exports.getOverview = catchAsync(async (req, res, next) => {
    const tours = await Tour.find();

    res.status(200).render('overview', { title: 'All Tours', tours: tours });
})

exports.getTour = catchAsync(async (req, res, next) => {
    res.status(200).render('tour', { title: 'Forest Hiker' });
})