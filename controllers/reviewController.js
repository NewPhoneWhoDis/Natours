const Review = require('../models/reviewSchema');
//const APIFeatures = require('./../utils/apiFeatures');
const AppError = require('./../utils/appError');
const catchAsync = require('./../utils/catchAsync');

exports.getAllReviews = catchAsync(async (req, res, next) => {
    let filter = {};

    if (req.params.tourId) {
        filter = {
            tour: req.params.tourId
        };
    }

    const reviews = await Review.find(filter);

    res.status(200).json({ status: 'success', results: reviews.length, data: { reviews } });
})

exports.createReview = catchAsync(async (req, res, next) => {
    // Adding nestet routes and allowing the user to specify them himself
    if (!req.body.tour) req.body.tour = req.params.tourId

    if (!req.body.user) req.body.user = req.user.id

    const newReview = await Review.create(req.body);

    res.status(201).json({ status: 'success', data: { review: newReview } });
})

exports.getReview = catchAsync(async (req, res, next) => {
    const findReview = await Review.findById(req.params.id);

    if (!findReview) {
        return next(new AppError('The requested review does not exsist or is deleted by the Author!', 404));
    }

    res.status(200).json({ status: 'success', results: findReview, data: { review: findReview } });
})

exports.updateReview = catchAsync(async (req, res, next) => {
    const updatedReview = await Review.findByIdAndUpdate(req.params.id);

    if (!updatedReview) {
        return next(new AppError('Cannot update a review which does not exist!', 404));
    }

    res.status(200).json({ status: 'success', results: updatedReview, data: { review: updatedReview } });
})

exports.deleteReview = catchAsync(async (req, res, next) => {
    const review = await findByIdAndDelete(req.params.id);

    if (!review) {
        return next(new AppError('Cannot find and delete review with the given ID', 404));
    }

    res.status(204).json({ status: 'success', data: null });
})