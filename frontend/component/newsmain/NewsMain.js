import React, { useState, useEffect } from 'react';
import { ClipLoader } from 'react-spinners';
import moment from 'moment';
import './NewsMain.css';
import { fetchPosts } from '../../services/api/postService';
import { useNavigate } from 'react-router-dom';
import Menu from '../home/menu/Menu';
import FooterSection from '../home/footerSection/FooterSection';
import { FaCalendarAlt } from 'react-icons/fa';

function arrayBufferToBase64(buffer) {
    let binary = '';
    const bytes = new Uint8Array(buffer);
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
}

function NewsMain() {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [visiblePostsCount, setVisiblePostsCount] = useState(6);
    const [selectedTag, setSelectedTag] = useState('Tất cả'); // Tab được chọn
    const navigate = useNavigate();

    const loadPosts = async () => {
        setLoading(true);
        try {
            const data = await fetchPosts();
            const postsWithEmbeddedImages = data.map((post) => ({
                ...post,
                embeddedImages: post.EmbeddedImages ? JSON.parse(post.EmbeddedImages) : [],
                tags: post.Tags ? (typeof post.Tags === 'string' ? JSON.parse(post.Tags) : post.Tags) : [],
            }));

            const sortedPosts = postsWithEmbeddedImages.sort((a, b) => new Date(b.Date) - new Date(a.Date));
            setPosts(sortedPosts);
        } catch (error) {
            console.error('Lỗi khi tải danh sách bài viết:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadPosts();
    }, []);

    if (loading) {
        return (
            <div className="news-main-loading-spinner">
                <ClipLoader color="#3498db" loading={loading} size={50} />
            </div>
        );
    }

    const handleReadMore = (slug) => {
        navigate(`/news/${slug}`);
    };

    const handleLoadMore = () => {
        setVisiblePostsCount((prevCount) => prevCount + 6);
    };

    const handleShowLess = () => {
        setVisiblePostsCount((prevCount) => (prevCount > 6 ? prevCount - 6 : 6));
    };

    // Lấy tất cả các tag và loại bỏ trùng lặp
    const allTags = ['Tất cả', ...new Set(posts.flatMap((post) => post.tags || []))];

    // Lọc bài viết dựa trên tag được chọn
    const filteredPosts = selectedTag === 'Tất cả' ? posts : posts.filter((post) => post.tags.includes(selectedTag));

    return (
        <>
            <Menu />
            <div className="news-main-banner">
                <h1>CHÀO MỪNG ĐẾN VỚI TRANG TIN TỨC BNS 911Cafe</h1>
                <p>Nơi cập nhật những tin tức mới nhất từ BNS 911Cafe</p>
            </div>
            <div className="news-main-container">
                <div className="news-heading">
                    <h1>TIN TỨC</h1>
                    
                </div>

                {/* Tabs cho Tags  hehe*/}
                <div className="news-main-tags">
                    {allTags.map((tag, index) => (
                        <button
                            key={index}
                            className={`news-main-tag-tab ${selectedTag === tag ? 'active' : ''}`}
                            onClick={() => setSelectedTag(tag)}
                        >
                            {tag}
                        </button>
                    ))}
                </div>

                <div className="news-main-posts-grid">
                    {filteredPosts.length > 0 ? (
                        filteredPosts.slice(0, visiblePostsCount).map((post) => {
                            let base64Image = '';
                            if (post.Image && post.Image.data) {
                                const imageType = 'jpeg';
                                base64Image = `data:image/${imageType};base64,${arrayBufferToBase64(post.Image.data)}`;
                            }

                            return (
                                <div
                                    key={post.Id}
                                    className="news-main-post-card"
                                    onClick={() => handleReadMore(post.Slug)}
                                >
                                    <div className="news-main-post-image-container">
                                        <img
                                            src={base64Image || '/path/to/default/image.jpg'}
                                            alt="Post"
                                            className="news-main-post-image"
                                            loading="lazy"
                                        />
                                    </div>
                                    <div className="news-main-post-content">
                                        {post.tags && post.tags.length > 0 && (
                                            <div className="news-sticker">
                                                {post.tags.map((tag, index) => (
                                                    <span key={index} className="news-main-tag">
                                                        {tag}
                                                    </span>
                                                ))}
                                            </div>
                                        )}
                                        <h2 className="news-main-post-title">{post.Title || 'Không có tiêu đề'}</h2>
                                        <p className="news-main-post-date">
                                            <FaCalendarAlt className="date-icon" />
                                            {moment(post.Date).format('DD/MM/YYYY')}
                                        </p>
                                        <p
                                            className="news-main-post-excerpt"
                                            dangerouslySetInnerHTML={{
                                                __html:
                                                    post.Content && post.Content.length > 100
                                                        ? `${post.Content.substring(0, 100)}...`
                                                        : post.Content || 'Không có nội dung',
                                            }}
                                        ></p>
                                    </div>
                                </div>
                            );
                        })
                    ) : (
                        <p>Không có bài viết nào</p>
                    )}
                </div>
                <div className="news-main-buttons">
                    {visiblePostsCount < filteredPosts.length && (
                        <button className="news-main-load-more-btn" onClick={handleLoadMore}>
                            Xem thêm
                        </button>
                    )}
                    {visiblePostsCount > 6 && (
                        <button className="news-main-show-less-btn" onClick={handleShowLess}>
                            Ẩn bớt
                        </button>
                    )}
                </div>
            </div>
            <FooterSection />
        </>
    );
}

export default NewsMain;
