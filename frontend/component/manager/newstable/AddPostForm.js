import React, { useState, useRef, useEffect } from 'react';
import ReactQuill from 'react-quill';
import { submitPost } from '../../../services/api/postService';
import { modules, formats } from '../../../config/quillConfig';
import 'react-quill/dist/quill.snow.css';
import './AddPostForm.css';

function AddPostForm({ isOpen, onClose, onSave, editingPost, onUpdate }) {
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [image, setImage] = useState(null);
    const [previewImage, setPreviewImage] = useState(null);
    const [tags, setTags] = useState([]);

    const quillRef = useRef(null);

    // Hàm chuyển đổi Buffer sang base64
    const arrayBufferToBase64 = (buffer) => {
        let binary = '';
        const bytes = new Uint8Array(buffer);
        const len = bytes.byteLength;
        for (let i = 0; i < len; i++) {
            binary += String.fromCharCode(bytes[i]);
        }
        return window.btoa(binary);
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImage(file);
            setPreviewImage(URL.createObjectURL(file));
        }
    };

    const handleTagChange = (e) => setTags(e.target.value.split(','));

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Thu thập các ảnh nhúng
        const parser = new DOMParser();
        const doc = parser.parseFromString(content, 'text/html');
        const images = doc.querySelectorAll('img');
        let imageArray = [];
        images.forEach((img) => {
            const src = img.getAttribute('src');
            if (src && src.startsWith('data:image')) {
                imageArray.push(src); // Thu thập ảnh nhúng dạng base64
            }
        });

        const formData = new FormData();
        formData.append('title', title);
        formData.append('content', content); // Lưu toàn bộ nội dung HTML để giữ định dạng
        formData.append('date', new Date().toISOString());
        formData.append('image', image); // Ảnh đính kèm
        formData.append('tags', JSON.stringify(tags));
        imageArray.forEach((img, index) => {
            formData.append(`embeddedImage${index}`, img); // Thêm ảnh nhúng
        });

        try {
            if (editingPost) {
                await onUpdate(editingPost.Id, formData); // Cập nhật bài viết
            } else {
                await submitPost(formData); // Thêm mới bài viết
                onSave();
            }
            onClose();
        } catch (error) {
            alert('Đã xảy ra lỗi khi lưu bài viết. Vui lòng thử lại.');
        }
    };

    // Đặt lại form khi mở lại hoặc hiển thị dữ liệu bài viết để chỉnh sửa
    useEffect(() => {
        if (isOpen) {
            if (editingPost) {
                setTitle(editingPost.Title || '');
                setContent(editingPost.Content || '');
                setTags(
                    editingPost.Tags
                        ? Array.isArray(editingPost.Tags)
                            ? editingPost.Tags
                            : JSON.parse(editingPost.Tags)
                        : [],
                ); // Chuyển đổi tags nếu cần

                if (editingPost.Image && editingPost.Image.data) {
                    const base64String = `data:image/jpeg;base64,${arrayBufferToBase64(editingPost.Image.data)}`;
                    setPreviewImage(base64String);
                } else {
                    setPreviewImage(null);
                }
            } else {
                setTitle('');
                setContent('');
                setTags([]); // Đặt lại tags nếu là bài viết mới
                setImage(null);
                setPreviewImage(null);
            }
        }
    }, [isOpen, editingPost]);

    if (!isOpen) return null;

    return (
        <div className="popup-overlay">
            <div className="popup-content">
                <h2>{editingPost ? 'Chỉnh sửa Bài Viết' : 'Thêm Bài Viết Mới'}</h2>
                <form onSubmit={handleSubmit}>
                    <label>Ảnh:</label>
                    <input type="file" onChange={handleImageChange} />
                    {previewImage && (
                        <div className="preview-image-container">
                            <img src={previewImage} alt="Preview" className="preview-image" />
                        </div>
                    )}
                    <label>Tiêu đề:</label>
                    <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} required />

                    <label>Tags:</label>
                    <input
                        type="text"
                        value={tags.join(',')}
                        onChange={handleTagChange}
                        placeholder="Nhập tags, cách nhau bằng dấu phẩy"
                    />

                    <label>Nội dung:</label>
                    <div className="editor-container">
                        <ReactQuill
                            ref={quillRef}
                            value={content}
                            onChange={(value) => setContent(value)}
                            modules={modules}
                            formats={formats}
                        />
                    </div>

                    <div className="button-group">
                        <button type="submit" className="submit-btn">
                            {editingPost ? 'Cập nhật Bài Viết' : 'Lưu Bài Viết'}
                        </button>
                        <button type="button" className="close-btn" onClick={onClose}>
                            Đóng
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default AddPostForm;
