import React, { useState, useEffect } from 'react';
import './NewsSection.css';
import { RiArrowRightSFill } from 'react-icons/ri';
import { fetchPosts } from '../../../services/api/postService';
import { useNavigate } from 'react-router-dom';

function arrayBufferToBase64(buffer) {
    let binary = '';
    const bytes = new Uint8Array(buffer);
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
}

function truncateText(text, maxLength) {
    return text.length > maxLength ? `${text.substring(0, maxLength)}...` : text;
}

const NewsSection = () => {
    const [posts, setPosts] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        const loadPosts = async () => {
            try {
                const data = await fetchPosts();

                // Loại bỏ bài viết trùng lặp dựa trên `Slug`
                const uniquePosts = data.filter(
                    (post, index, self) => index === self.findIndex((p) => p.Slug === post.Slug),
                );

                // Xác định bài viết chính
                const mainNewsPost = uniquePosts.find((post) => post.isMainNews) || uniquePosts[0];
                const otherPosts = uniquePosts.filter((post) => post !== mainNewsPost);

                const processedPosts = [mainNewsPost, ...otherPosts].map((post) => ({
                    ...post,
                    tags: post.Tags ? (typeof post.Tags === 'string' ? JSON.parse(post.Tags) : post.Tags) : [],
                }));

                setPosts(processedPosts.slice(0, 5)); // Lấy tối đa 5 bài viết
            } catch (error) {
                console.error('Lỗi khi tải bài viết:', error);
            }
        };

        loadPosts();
    }, []);

    const handleViewMoreClick = () => {
        navigate('/news');
    };

    const handleNewsClick = (slug) => {
        navigate(`/news/${slug}`);
    };

    return (
        <section className="news-section">
            <div className="news-section-content">
                {/* Hàng 1: Tiêu đề */}
                <div className="news-section-title-row">
                    <h1 className="news-section-title">TIN TỨC NỔI BẬT</h1>
                    <button className="news-section-view-more-button" onClick={handleViewMoreClick}>
                        XEM THÊM <RiArrowRightSFill size={30} />
                    </button>
                </div>

                {/* Hàng 2: Container chứa tin tức */}
                <div className="news-section-container">
                    {/* Cột tin chính */}
                    {posts.length > 0 && (
                        <div
                            className="news-section-column news-section-main-news"
                            onClick={() => handleNewsClick(posts[0].Slug)}
                        >
                            <div className="news-section-main-news-content">
                                {posts[0].Image && posts[0].Image.data && (
                                    <img
                                        src={`data:image/jpeg;base64,${arrayBufferToBase64(posts[0].Image.data)}`}
                                        alt="Tin chính"
                                        className="news-section-main-news-image"
                                    />
                                )}

                                <h2 className="news-section-main-news-title">{truncateText(posts[0].Title, 50)}</h2>
                                {posts[0].tags && posts[0].tags.length > 0 && (
                                    <div className="news-section-main-news-tags">
                                        {posts[0].tags.map((tag, index) => (
                                            <span key={`${tag}-${index}`} className="news-section-tag">
                                                {tag}
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Cột tin phụ */}
                    <div className="news-section-column news-section-secondary-news">
                        {posts.slice(1, 5).map((post, index) => (
                            <div
                                key={`${post.Slug}-${index}`} // Sử dụng kết hợp `Slug` và `index` để tạo key duy nhất
                                className="news-section-item"
                                onClick={() => handleNewsClick(post.Slug)}
                            >
                                <div className="news-section-sub-news-content">
                                    <h3 className="news-section-sub-news-title">{truncateText(post.Title, 30)}</h3>
                                    {post.tags && post.tags.length > 0 && (
                                        <div className="news-section-sub-news-tags">
                                            {post.tags.map((tag, tagIndex) => (
                                                <span key={`${tag}-${tagIndex}`} className="news-section-tag">
                                                    {tag}
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </div>
                                {post.Image && post.Image.data && (
                                    <img
                                        src={`data:image/jpeg;base64,${arrayBufferToBase64(post.Image.data)}`}
                                        alt={`Tin phụ ${post.Title}`}
                                        className="news-section-sub-news-image"
                                    />
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
};

export default NewsSection;
