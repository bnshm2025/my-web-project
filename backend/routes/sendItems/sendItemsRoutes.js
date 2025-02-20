const express = require('express');
const { sendItem } = require('../../controllers/sendItems/sendItemsController');

const router = express.Router();

router.post('/send-item', async (req, res) => {
    try {
        const { charname, itemID, itemCount } = req.body;

        if (!charname || !itemID || !itemCount) {
            return res.status(400).json({ error: 'Missing required fields (charname, itemID, itemCount)' });
        }

        const result = await sendItem({ charname, itemID, itemCount });
        return res.status(200).json(result);
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: err.message });
    }
});

module.exports = router;
