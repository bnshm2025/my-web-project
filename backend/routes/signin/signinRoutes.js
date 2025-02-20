const express = require('express');
const { signinController } = require('../../controllers/signin/signinController');
const { authenticateToken, redirectIfAuthenticated } = require('../../utils/authMiddleware');

const router = express.Router();

router.get('/signin', redirectIfAuthenticated, (req, res) => {
    res.render('signin');
});

router.post('/signin', signinController);

router.post('/signout', (req, res) => {
    res.clearCookie('authToken', {
        httpOnly: true,
        secure: true,
        sameSite: 'Strict',
    });
    res.status(200).send('Đăng xuất thành công');
});

module.exports = router;
