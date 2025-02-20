const express = require('express');
const { checkAvailabilityController } = require('../../controllers/checkAvailability/checkAvailabilityController');

const router = express.Router();

// Route cho yêu cầu GET /check-availability
router.get('/check-availability', checkAvailabilityController);

module.exports = router;
