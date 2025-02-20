const postRepository = require('../../repositories/post/postRepository');

class SearchController {
    async searchPosts(req, res) {
        try {
            const { keyword } = req.query;
            if (!keyword) {
                return res.status(400).json({ error: 'Keyword is required' });
            }

            const posts = await postRepository.searchPosts(keyword); // Gọi repository để tìm kiếm
            res.status(200).json(posts); // Trả về danh sách bài viết phù hợp
        } catch (error) {
            console.error('Error searching posts:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }
}

module.exports = new SearchController();
