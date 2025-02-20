const express = require('express');
const { signupController } = require('../../controllers/signup/signupController');
const { redirectIfAuthenticated } = require('../../utils/authMiddleware');

const router = express.Router();

router.get('/signup', redirectIfAuthenticated, (req, res) => {
    res.render('signup');
});

// Định tuyến yêu cầu POST đến /signup để gọi signupController
router.post(
    '/signup',
    (req, res, next) => {
        console.log('POST request to /signup');
        next();
    },
    signupController,
);

module.exports = router;
