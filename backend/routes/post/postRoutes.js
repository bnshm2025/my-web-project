const express = require('express');
const multer = require('multer');
const postController = require('../../controllers/post/postController');
const router = express.Router();
const upload = multer();

router.post('/posts', upload.single('image'), (req, res) => postController.createPost(req, res));
router.get('/posts', (req, res) => postController.getPosts(req, res));
router.delete('/posts/:id', (req, res) => postController.deletePost(req, res));
router.put('/posts/:id', upload.single('image'), (req, res) => postController.updatePost(req, res));
router.get('/posts/:id', (req, res) => postController.getPostById(req, res));
router.put('/posts/:id/setMainNews', (req, res) => postController.setMainNews(req, res));
router.get('/posts/slug/:slug', (req, res) => postController.getPostBySlug(req, res));

module.exports = router;
