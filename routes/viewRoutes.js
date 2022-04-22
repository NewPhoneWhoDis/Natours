const express = require('express');
const viewController = require('../controllers/viewsController');

const router = express.Router();

//Overview
router.get('/', viewController.getOverview);

//Tour
router.get('/tour', viewController.getTour);

module.exports = router;