const express = require('express');
const searchController = require('../../controllers/search/searchController');
const router = express.Router();

// Route tìm kiếm bài viết
router.get('/search', (req, res) => searchController.searchPosts(req, res));

module.exports = router;
