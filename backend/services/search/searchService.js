const searchService = require('../../services/search/searchService');

class SearchService {
    async searchPosts(keyword) {
        if (!keyword || typeof keyword !== 'string' || keyword.trim() === '') {
            throw new Error('Keyword must be a non-empty string');
        }

        console.log(`Searching posts with keyword: ${keyword}`); // Log kiểm tra keyword
        return await postRepository.searchPosts(keyword);
    }
}

module.exports = new SearchService();
