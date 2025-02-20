const { connectBNSPostsWebDb, sql } = require('../../config/db');

class PostRepository {
    async createPost(post) {
        const pool = await connectBNSPostsWebDb;
        await pool
            .request()
            .input('Title', sql.NVarChar, post.title)
            .input('Content', sql.NText, post.content)
            .input('Date', sql.DateTime, post.date)
            .input('Image', sql.VarBinary(sql.MAX), post.image)
            .input('EmbeddedImages', sql.NText, JSON.stringify(post.embeddedImages))
            .input('Tags', sql.NText, JSON.stringify(post.tags))
            .input('Slug', sql.NVarChar, post.slug) // Thêm slug
            .query(
                `INSERT INTO Posts (Title, Content, Date, Image, EmbeddedImages, Tags, Slug) VALUES (@Title, @Content, @Date, @Image, @EmbeddedImages, @Tags, @Slug)`,
            );
    }

    async getPosts() {
        // Thêm hàm getPosts để lấy tất cả bài viết
        const pool = await connectBNSPostsWebDb;
        const result = await pool.request().query('SELECT * FROM Posts');
        return result.recordset;
    }

    async deletePost(postId) {
        const pool = await connectBNSPostsWebDb;
        await pool.request().input('PostId', sql.Int, postId).query('DELETE FROM Posts WHERE Id = @PostId');
    }

    async updatePost(postId, postData) {
        const pool = await connectBNSPostsWebDb;
        const request = pool
            .request()
            .input('PostId', sql.Int, postId)
            .input('Title', sql.NVarChar, postData.title)
            .input('Content', sql.NVarChar, postData.content)
            .input('Date', sql.DateTime, postData.date)
            .input('Tags', sql.NText, JSON.stringify(postData.tags))
            .input('Slug', sql.NVarChar, postData.slug); // Thêm slug

        if (postData.image) {
            request.input('Image', sql.VarBinary, postData.image);
            await request.query(
                `UPDATE Posts SET Title = @Title, Content = @Content, Date = @Date, Image = @Image, Tags = @Tags, Slug = @Slug WHERE Id = @PostId`,
            );
        } else {
            await request.query(
                `UPDATE Posts SET Title = @Title, Content = @Content, Date = @Date, Tags = @Tags, Slug = @Slug WHERE Id = @PostId`,
            );
        }
    }

    async getPostById(postId) {
        const pool = await connectBNSPostsWebDb;
        const result = await pool
            .request()
            .input('PostId', sql.Int, postId)
            .query('SELECT * FROM Posts WHERE Id = @PostId');
        return result.recordset[0];
    }

    async setMainNews(postId) {
        const pool = await connectBNSPostsWebDb;
        // Đặt tất cả bài viết về không phải tin chính
        await pool.request().query('UPDATE Posts SET isMainNews = 0');
        // Đặt bài viết với `postId` là tin chính
        await pool
            .request()
            .input('PostId', sql.Int, postId)
            .query('UPDATE Posts SET isMainNews = 1 WHERE Id = @PostId');
    }

    async getPostBySlug(slug) {
        const pool = await connectBNSPostsWebDb;
        const result = await pool
            .request()
            .input('Slug', sql.NVarChar, slug)
            .query('SELECT * FROM Posts WHERE Slug = @Slug');
        return result.recordset[0];
    }

    // search
    async searchPosts(keyword) {
        try {
            const pool = await connectBNSPostsWebDb;
            const result = await pool.request().input('Keyword', sql.NVarChar, `%${keyword}%`).query(`
                    SELECT * 
                    FROM Posts
                    WHERE 
                        Title LIKE @Keyword OR
                        Content LIKE @Keyword OR
                        Tags LIKE @Keyword
                `);
            return result.recordset;
        } catch (error) {
            console.error('Error in searchPosts repository:', error);
            throw error;
        }
    }
}

module.exports = new PostRepository();
