const express = require('express');
const tourController = require('./../controllers/tourController');

const router = express.Router();

// mostPopular is middleware that manipulates the query object before it reaches /most-popular

// Implementing route for most popular tours requested by Users
router.route('/most-popular').get(tourController.mostPopular, tourController.getAllTours);

router.route('/tour-statistics').get(tourController.getToutStatistics);

router.route('/monthly-plan/:year').get(tourController.getMonthlyPlan);

router
    .route('/')
    .get(tourController.getAllTours)
    .post(tourController.createTour);
router
    .route('/:id')
    .get(tourController.getTour)
    .patch(tourController.updateTour)
    .delete(tourController.deleteTour);

module.exports = router;