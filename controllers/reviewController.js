const Review = require('../models/reviewSchema');
const factory = require('./handlerFactory');

exports.setTourAndUserIds = (req, res, next) => {
    // Adding nestet routes and allowing the user to specify them himself
    if (!req.body.tour) req.body.tour = req.params.tourId

    if (!req.body.user) req.body.user = req.user.id

    next();
}

exports.getAllReviews = factory.getAll(Review);

exports.getReview = factory.getOne(Review);

exports.createReview = factory.createOne(Review);

exports.updateReview = factory.updateOne(Review);

exports.deleteReview = factory.deleteOne(Review);