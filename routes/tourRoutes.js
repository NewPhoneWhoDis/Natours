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

router.route('/monthly-plan/:year').get(authController.protect, authController.restrictTo('admin', 'lead-guide', 'guide'),
    tourController.getMonthlyPlan);

// gets the tours within user's current location with option of specifying kilometers or miles
router.route('/tours-within/:distance/center/:latlng/unit/:unit').get(tourController.getToursWithin);

//* Calculation of distances
router.route('/distances/:latlng/unit/:unit').get(tourController.getDistances);

router
    .route('/')
    .get(tourController.getAllTours)
    .post(authController.protect, authController.restrictTo('lead-guide', 'admin'), tourController.createTour);
router
    .route('/:id')
    .get(tourController.getTour)
    .patch(authController.protect, authController.restrictTo('admin', 'lead-guide'), tourController.updateTour)
    .delete(authController.protect, authController.restrictTo('admin', 'lead-guide'), tourController.deleteTour);

module.exports = router;