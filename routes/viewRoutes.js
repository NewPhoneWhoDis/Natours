
const express = require('express');
const viewController = require('../controllers/viewsController');
const authController = require('../controllers/authController');


const router = express.Router();


router.use(authController.isLoggedIn);

//Overview
router.get('/', viewController.getOverview);

//Tour
router.get('/tour/:slug', viewController.getTour);

router.get('/login', viewController.getLoginForum);

router.get('/signup', viewController.getSignUpForum);


module.exports = router;

