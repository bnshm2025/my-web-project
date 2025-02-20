const postService = require('../../services/post/postService');
const sharp = require('sharp');

async function convertToWebP(imageBuffer) {
    return await sharp(imageBuffer).resize({ width: 800 }).webp({ quality: 80 }).toBuffer();
}

class PostController {
    async createPost(req, res) {
        try {
            const { title, content, date, tags } = req.body;
            let webpImage = null;
            if (req.file) {
                webpImage = await convertToWebP(req.file.buffer);
            }

            const embeddedImages = Object.keys(req.body)
                .filter((key) => key.startsWith('embeddedImage'))
                .map((key) => req.body[key]);

            await postService.addNewPost(title, content, date, webpImage, embeddedImages, tags ? JSON.parse(tags) : []);
            res.status(201).json({ message: 'Bài viết đã được lưu' });
        } catch (error) {
            res.status(500).json({ error: 'Đã xảy ra lỗi khi lưu bài viết' });
        }
    }

    async getPosts(req, res) {
        // Thêm hàm getPosts để lấy danh sách bài viết
        try {
            const posts = await postService.getAllPosts();
            res.status(200).json(posts);
        } catch (error) {
            res.status(500).json({ error: 'Đã xảy ra lỗi khi lấy danh sách bài viết' });
            console.log(error);
        }
    }

    async deletePost(req, res) {
        try {
            const postId = req.params.id;
            await postService.deletePostById(postId);
            res.status(200).json({ message: 'Bài viết đã được xóa thành công' });
        } catch (error) {
            res.status(500).json({ error: 'Đã xảy ra lỗi khi xóa bài viết' });
            console.log(error);
        }
    }

    async updatePost(req, res) {
        try {
            const postId = req.params.id;
            const { title, content, date, tags } = req.body;
            const image = req.file ? req.file.buffer : null;
            await postService.updatePostById(postId, {
                title,
                content,
                date,
                image,
                tags: tags ? JSON.parse(tags) : [],
            });
            res.status(200).json({ message: 'Bài viết đã được cập nhật thành công' });
        } catch (error) {
            res.status(500).json({ error: 'Đã xảy ra lỗi khi cập nhật bài viết' });
        }
    }
    async getPostById(req, res) {
        try {
            const postId = req.params.id;
            const post = await postService.getPostById(postId);
            if (post) {
                res.status(200).json(post);
            } else {
                res.status(404).json({ error: 'Bài viết không tồn tại' });
            }
        } catch (error) {
            res.status(500).json({ error: 'Đã xảy ra lỗi khi lấy chi tiết bài viết' });
            console.log(error);
        }
    }
    async setMainNews(req, res) {
        try {
            const postId = req.params.id;
            await postService.setMainNews(postId);
            res.status(200).json({ message: 'Tin chính đã được cập nhật thành công' });
        } catch (error) {
            res.status(500).json({ error: 'Đã xảy ra lỗi khi cập nhật tin chính' });
        }
    }

    async getPostBySlug(req, res) {
        try {
            const slug = req.params.slug;
            const post = await postService.getPostBySlug(slug);
            if (post) {
                res.status(200).json(post);
            } else {
                res.status(404).json({ error: 'Bài viết không tồn tại' });
            }
        } catch (error) {
            res.status(500).json({ error: 'Đã xảy ra lỗi khi lấy chi tiết bài viết' });
        }
    }
}

module.exports = new PostController();
