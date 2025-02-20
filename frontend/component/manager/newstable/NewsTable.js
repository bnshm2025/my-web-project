import React, { useState, useEffect } from 'react';
import './NewsTable.css';
import AddPostForm from './AddPostForm';
import { fetchPosts, deletePost, updatePost, setMainNews } from '../../../services/api/postService';
import moment from 'moment';
import { ClipLoader } from 'react-spinners';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function arrayBufferToBase64(buffer) {
    let binary = '';
    const bytes = new Uint8Array(buffer);
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
}

function NewsTable() {
    const [posts, setPosts] = useState([]);
    const [filteredPosts, setFilteredPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [editingPost, setEditingPost] = useState(null);
    const postsPerPage = 10;

    let toastShown = false;

    const loadPosts = async (showToast = true) => {
        setLoading(true);
        try {
            const data = await fetchPosts();
            const postsWithEmbeddedImages = data
                .map((post) => ({
                    ...post,
                    embeddedImages: post.EmbeddedImages ? JSON.parse(post.EmbeddedImages) : [],
                }))
                .sort((a, b) => new Date(b.Date) - new Date(a.Date));

            setPosts(postsWithEmbeddedImages);
            setFilteredPosts(postsWithEmbeddedImages);

            if (showToast && !toastShown) {
                toast.success('Hoàn thành tải bài viết!');
                toastShown = true;
            }
        } catch (error) {
            console.error('Lỗi khi tải danh sách bài viết:', error);
            toast.error('Không thể tải danh sách bài viết. Vui lòng thử lại sau.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadPosts();
    }, []);

    const handleSavePost = async () => {
        try {
            await loadPosts();
            setCurrentPage(1);
            toast.success('Bài viết đã được lưu thành công!');
        } catch (error) {
            toast.error('Đã xảy ra lỗi khi lưu bài viết.');
        } finally {
            setIsFormOpen(false);
        }
    };

    const handleSearch = (e) => {
        setSearchTerm(e.target.value);
        const term = e.target.value.toLowerCase();
        const filtered = posts.filter(
            (post) =>
                post.Title.toLowerCase().includes(term) || (post.Content && post.Content.toLowerCase().includes(term)),
        );
        setFilteredPosts(filtered);
        setCurrentPage(1);
    };

    const handleDelete = async (postId) => {
        if (window.confirm('Bạn có chắc chắn muốn xóa bài viết này?')) {
            try {
                await deletePost(postId);
                toast.success('Bài viết đã được xóa thành công!');
                await loadPosts();
            } catch (error) {
                toast.error('Đã xảy ra lỗi khi xóa bài viết.');
            }
        }
    };

    const handleEdit = (post) => {
        setEditingPost(post);
        setIsFormOpen(true);
    };

    const handleUpdatePost = async (postId, updatedData) => {
        try {
            await updatePost(postId, updatedData);
            await loadPosts();
            toast.success('Bài viết đã được cập nhật thành công!');
        } catch (error) {
            toast.error('Đã xảy ra lỗi khi cập nhật bài viết.');
        } finally {
            setEditingPost(null);
            setIsFormOpen(false);
        }
    };

    const handleSetMainNews = async (postId) => {
        try {
            await setMainNews(postId);
            toast.success('Đã chọn bài viết làm tin chính!');
            await loadPosts();
        } catch (error) {
            toast.error('Đã xảy ra lỗi khi chọn tin chính');
        }
    };

    const goToNextPage = () => {
        if (currentPage < totalPages) setCurrentPage(currentPage + 1);
    };

    const goToPreviousPage = () => {
        if (currentPage > 1) setCurrentPage(currentPage - 1);
    };

    const indexOfLastPost = currentPage * postsPerPage;
    const indexOfFirstPost = indexOfLastPost - postsPerPage;
    const currentPosts = Array.isArray(filteredPosts) ? filteredPosts.slice(indexOfFirstPost, indexOfLastPost) : [];
    const totalPages = Math.ceil(filteredPosts.length / postsPerPage);

    return (
        <div className="news-table-container">
            <ToastContainer autoClose={3000} position="top-right" />
            <div className="table-header">
                <input
                    type="text"
                    className="search-bar"
                    placeholder="Tìm kiếm bài viết..."
                    value={searchTerm}
                    onChange={handleSearch}
                />
                <button
                    className="add-post-btn"
                    onClick={() => {
                        setIsFormOpen(true);
                        setEditingPost(null);
                    }}
                >
                    Thêm Bài Viết
                </button>
            </div>

            {loading ? (
                <div className="loading-spinner">
                    <ClipLoader color="#3498db" loading={loading} size={50} />
                </div>
            ) : (
                <div>
                    <div className="news-table-scroll">
                        <table className="news-table">
                            <thead>
                                <tr>
                                    <th className="stt-column">STT</th>
                                    <th>Ảnh</th>
                                    <th>Tiêu đề</th>
                                    <th>Nội dung</th>
                                    <th>Ngày đăng</th>
                                    <th>Chọn tin chính</th> {/* Cột radio tin chính */}
                                    <th>Thao tác</th>
                                </tr>
                            </thead>
                            <tbody>
                                {currentPosts.length > 0 ? (
                                    currentPosts.map((post, index) => {
                                        const serialNumber = indexOfFirstPost + index + 1;
                                        let base64Image = '';
                                        if (post.Image && post.Image.data) {
                                            const imageType = 'jpeg';
                                            base64Image = `data:image/${imageType};base64,${arrayBufferToBase64(
                                                post.Image.data,
                                            )}`;
                                        }

                                        return (
                                            <tr key={index}>
                                                <td className="stt-column">{serialNumber}</td>
                                                <td className="post-image-column">
                                                    <img
                                                        src={base64Image || '/path/to/default/image.jpg'}
                                                        alt="Post"
                                                        className="post-image"
                                                    />
                                                </td>
                                                <td className="title-column">{post.Title || 'Không có tiêu đề'}</td>
                                                <td className="content-column">
                                                    <span className="post-content">
                                                        {post.Content
                                                            ? new DOMParser().parseFromString(post.Content, 'text/html')
                                                                  .body.textContent
                                                            : 'Không có nội dung'}
                                                    </span>
                                                </td>
                                                <td className="date-column">
                                                    {post.Date ? moment(post.Date).format('DD/MM/YYYY') : 'N/A'}
                                                </td>
                                                <td className="main-news-column">
                                                    {/* Radio chọn tin chính */}
                                                    <input
                                                        type="radio"
                                                        name="mainNews"
                                                        checked={post.isMainNews}
                                                        onChange={() => handleSetMainNews(post.Id)}
                                                    />
                                                </td>
                                                <td className="actions-column">
                                                    <div className="action-buttons">
                                                        <button className="edit-btn" onClick={() => handleEdit(post)}>
                                                            Chỉnh sửa
                                                        </button>
                                                        <button
                                                            className="delete-btn"
                                                            onClick={() => handleDelete(post.Id)}
                                                        >
                                                            Xóa
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })
                                ) : (
                                    <tr>
                                        <td colSpan="7">Không có bài viết nào</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                    <div className="pagination">
                        <button onClick={goToPreviousPage} disabled={currentPage === 1}>
                            Trước
                        </button>
                        <span>
                            Trang {currentPage} / {totalPages}
                        </span>
                        <button onClick={goToNextPage} disabled={currentPage === totalPages}>
                            Sau
                        </button>
                    </div>
                    <div className="total-posts">
                        Bài viết: {filteredPosts.length}/{posts.length}
                    </div>
                </div>
            )}

            <AddPostForm
                isOpen={isFormOpen}
                onClose={() => setIsFormOpen(false)}
                onSave={handleSavePost}
                editingPost={editingPost}
                onUpdate={handleUpdatePost}
            />
        </div>
    );
}

export default NewsTable;
