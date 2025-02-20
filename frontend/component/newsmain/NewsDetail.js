import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ClipLoader } from 'react-spinners';
import moment from 'moment';
import './NewsDetail.css';
import { fetchPostBySlug, fetchPosts } from '../../services/api/postService';
import Menu from '../home/menu/Menu';
import FooterSection from '../home/footerSection/FooterSection';
import { FaCalendarAlt, FaFacebook, FaDiscord } from 'react-icons/fa';

function arrayBufferToBase64(buffer) {
    let binary = '';
    const bytes = new Uint8Array(buffer);
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
}

function NewsDetail() {
    const { slug } = useParams();
    const [post, setPost] = useState(null);
    const [loading, setLoading] = useState(true);
    const [latestPosts, setLatestPosts] = useState([]);

    const loadData = async () => {
        setLoading(true);
        try {
            // Tải bài viết chính và danh sách bài viết mới nhất
            const [postData, latestPostsData] = await Promise.all([fetchPostBySlug(slug), fetchPosts()]);

            // Thiết lập dữ liệu bài viết chính
            setPost({
                ...postData,
                Tags: typeof postData.Tags === 'string' ? JSON.parse(postData.Tags) : postData.Tags,
            });

            // Lọc và sắp xếp các bài viết mới nhất
            const uniqueLatestPosts = latestPostsData.filter(
                (post, index, self) => index === self.findIndex((p) => p.Slug === post.Slug),
            );
            const sortedPosts = uniqueLatestPosts.sort((a, b) => new Date(b.Date) - new Date(a.Date)).slice(0, 6);
            setLatestPosts(sortedPosts);
        } catch (error) {
            console.error('Lỗi khi tải dữ liệu:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, [slug]);

    if (loading) {
        return (
            <div className="loading-spinner">
                <ClipLoader color="#3498db" loading={loading} size={50} />
            </div>
        );
    }

    if (!post) {
        return <p>Bài viết không tồn tại.</p>;
    }

    const base64Image =
        post.Image && post.Image.data ? `data:image/jpeg;base64,${arrayBufferToBase64(post.Image.data)}` : '';

    return (
        <>
            <Menu isStatic />
            <div className="background-news-detail">
                <div className="social-media-column">
                    <a
                        href="https://www.facebook.com/profile.php?id=61567494682969"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="social-icon"
                    >
                        <FaFacebook />
                    </a>
                    <a
                        href="https://discord.gg/ZWkXzXdBBn"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="social-icon"
                    >
                        <FaDiscord />
                    </a>
                </div>
                <div className="container-news-detail">
                    <div className="news-content-details">
                        {post.Tags && post.Tags.length > 0 && (
                            <div className="news-tags">
                                {post.Tags.map((tag, index) => (
                                    <span key={`${tag}-${index}`} className="news-tag">
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        )}
                        <h1 className="news-title">{post.Title || 'Không có tiêu đề'}</h1>
                        <p className="news-date">
                            <FaCalendarAlt className="date-icon" />
                            {moment(post.Date).format('DD/MM/YYYY')}
                        </p>
                        {base64Image && <img src={base64Image} alt="Post" className="news-image" />}
                        <div className="news-content-body" dangerouslySetInnerHTML={{ __html: post.Content }}></div>
                    </div>

                    <div className="latest-news">
                        <h3 className="latest-news-title">Tin Tức Mới Nhất</h3>
                        <ul className="latest-news-list">
                            {latestPosts.map((latestPost, index) => {
                                const latestBase64Image =
                                    latestPost.Image && latestPost.Image.data
                                        ? `data:image/jpeg;base64,${arrayBufferToBase64(latestPost.Image.data)}`
                                        : '';

                                return (
                                    <li key={`${latestPost.Slug}-${index}`} className="latest-news-item">
                                        <Link to={`/news/${latestPost.Slug}`} className="latest-news-link">
                                            {latestBase64Image && (
                                                <img
                                                    src={latestBase64Image}
                                                    alt="Post thumbnail"
                                                    className="latest-news-image"
                                                />
                                            )}
                                            <div className="latest-news-info">
                                                <p className="latest-news-date">
                                                    <FaCalendarAlt className="date-icon" />
                                                    {moment(latestPost.Date).format('DD/MM/YYYY')}
                                                </p>
                                                <h4 className="latest-new-title">{latestPost.Title}</h4>
                                            </div>
                                        </Link>
                                    </li>
                                );
                            })}
                        </ul>
                    </div>
                </div>
            </div>
            <FooterSection />
        </>
    );
}

export default NewsDetail;
