const express = require('express');
const {
    createVietQR,
    checkStatus,
    checkTransaction,
    createPaymentOrder,
    updatePaymentOrderStatus,
    handlePaymentSuccess,
    spendHMCoin,
} = require('../../controllers/Transactions/transactionsController');
const { authenticateToken } = require('../../utils/authMiddleware');

const router = express.Router();

router.post('/generate-vietqr', authenticateToken, createVietQR);

router.get('/status', checkStatus);

router.post('/create-payment-order', createPaymentOrder);

router.post('/update-payment-order-status', updatePaymentOrderStatus);

router.post('/check-transaction', checkTransaction);

router.post('/payment-success', handlePaymentSuccess);

router.post('/spend-hmcoin', spendHMCoin);

module.exports = router;
