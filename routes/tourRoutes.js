const express = require('express');
const tourController = require('./../controllers/tourController');
const authController = require('./../controllers/authController');
const reviewRouter = require('./reviewRoutes');

const router = express.Router();

router.use('/:tourId/reviews', reviewRouter);

// mostPopular is middleware that manipulates the query object before it reaches /most-popular
// Implementing route for most popular tours requested by Users
router.route('/most-popular').get(tourController.mostPopular, tourController.getAllTours);

router.route('/tour-statistics').get(tourController.getToutStatistics);

router.route('/monthly-plan/:year').get(tourController.getMonthlyPlan);

router
    .route('/')
    .get(authController.protect, tourController.getAllTours)
    .post(tourController.createTour);
router
    .route('/:id')
    .get(tourController.getTour)
    .patch(tourController.updateTour)
    .delete(authController.protect, authController.restrictTo('admin', 'lead-guide'), tourController.deleteTour);

/*
router.route('/:tourId/reviews')
.post(authController.protect, authController.restrictTo('user'), reviewController.createReview);
*/

module.exports = router;