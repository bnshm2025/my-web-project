const postRepository = require('../../repositories/post/postRepository');
const Post = require('../../models/post/postModel');
const slugify = require('slugify');

class PostService {
    async addNewPost(title, content, date, image, embeddedImages, tags) {
        const slug = slugify(title, { lower: true, strict: true });
        console.log(`Generated slug for new post: ${slug}`); // Log kiểm tra slug
        const post = new Post(title, content, date, image, embeddedImages, tags, slug);
        await postRepository.createPost(post);
    }

    async getAllPosts() {
        // Thêm hàm getAllPosts để lấy danh sách bài viết
        return await postRepository.getPosts();
    }

    async deletePostById(postId) {
        await postRepository.deletePost(postId);
    }
    async updatePostById(postId, postData) {
        postData.slug = slugify(postData.title, { lower: true, strict: true });
        console.log(`Updated slug for post ${postId}: ${postData.slug}`); // Log kiểm tra slug
        await postRepository.updatePost(postId, postData);
    }

    async getPostById(postId) {
        return await postRepository.getPostById(postId);
    }

    async setMainNews(postId) {
        await postRepository.setMainNews(postId);
    }

    async getPostBySlug(slug) {
        return await postRepository.getPostBySlug(slug);
    }
}

module.exports = new PostService();
