
const express = require('express');
const viewController = require('../controllers/viewsController');
const authController = require('../controllers/authController');
const bookingController = require('../controllers/bookingController');

const router = express.Router();


router.use(authController.isLoggedIn);

//Overview
router.get('/', bookingController.createBookingCheckout, viewController.getOverview);

//Tour
router.get('/tour/:slug', viewController.getTour);

router.get('/login', authController.isLoggedIn, viewController.getLoginForum);

router.get('/signup', viewController.getSignUpForum);

router.get('/me', authController.protect, viewController.getAccount);

router.get('/my-tours', authController.protect, viewController.getMyTours)

router.post('/submit-user-data', authController.protect, viewController.updateUserData);

module.exports = router;

