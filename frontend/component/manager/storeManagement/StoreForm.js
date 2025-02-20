import React, { useState, useRef, useEffect } from 'react';
import ReactQuill from 'react-quill';
import { submitStore } from '../../../services/api/storeManagementService';
import { modules, formats } from '../../../config/quillConfig';
import 'react-quill/dist/quill.snow.css';
import './StoreForm.css';

function StoreForm({ isOpen, onClose, onSave, editingStore, onUpdate }) {
    const [itemId, setId] = useState('');
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [type, setType] = useState('');
    const [itemImage, setImage] = useState(null);
    const [previewImage, setPreviewImage] = useState(null);
    const [price, setPrice] = useState('');
    const [discount, setDiscount] = useState('');

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

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Thu thập các ảnh nhúng
        const parser = new DOMParser();
        const doc = parser.parseFromString(description, 'text/html');
        const images = doc.querySelectorAll('img');
        let imageArray = [];
        images.forEach((img) => {
            const src = img.getAttribute('src');
            if (src && src.startsWith('data:itemImage')) {
                imageArray.push(src); // Thu thập ảnh nhúng dạng base64
            }
        });

        const formData = new FormData();
        formData.append('itemId', itemId);
        formData.append('itemName', name);
        formData.append('date', new Date().toISOString());
        formData.append('itemDescription', description);
        formData.append('itemType', type);
        formData.append('itemDiscount', parseInt(discount) || 0); // Đảm bảo là số
        formData.append('itemPrice', parseFloat(price) || 0); // Đảm bảo là số
        formData.append('itemImage', itemImage);
        imageArray.forEach((img, index) => {
            formData.append(`embeddedImage${index}`, img); // Thêm ảnh nhúng
        });

        try {
            if (editingStore) {
                await onUpdate(editingStore.Id, formData); // Đúng tham số
            } else {
                await submitStore(formData);
                onSave();
            }
            onClose();
        } catch (error) {
            alert('Đã xảy ra lỗi khi lưu vật phẩm.');
        }
    };

    useEffect(() => {
        if (isOpen) {
            if (editingStore) {
                setId(editingStore.ItemId || '');
                setName(editingStore.ItemName || '');
                setDescription(editingStore.ItemDescription || '');
                setType(editingStore.ItemType || '');
                setPrice(editingStore.ItemPrice || '');
                setDiscount(editingStore.ItemDiscount || '');

                if (editingStore.ItemImage && editingStore.ItemImage.data) {
                    const base64String = `data:itemImage/jpeg;base64,${arrayBufferToBase64(
                        editingStore.ItemImage.data,
                    )}`;
                    setPreviewImage(base64String);
                } else {
                    setPreviewImage(null);
                }
            } else {
                setId('');
                setName('');
                setDescription('');
                setType('');
                setPrice('');
                setDiscount('');
                setImage(null);
                setPreviewImage(null);
            }
        }
    }, [isOpen, editingStore]);

    if (!isOpen) return null;

    return (
        <div className="popup-overlay">
            <div className="container_form">
                <div className="popup-description">
                    <h2>{editingStore ? 'Chỉnh sửa Vật Phẩm' : 'Thêm Vật Phẩm Mới'}</h2>
                    <form onSubmit={handleSubmit}>
                        <label>Ảnh:</label>
                        <input type="file" onChange={handleImageChange} />
                        {previewImage && (
                            <div className="preview-image-container">
                                <img src={previewImage} alt="Preview" className="preview-image" />
                            </div>
                        )}
                        <label>Id vật phẩm:</label>
                        <input type="text" value={itemId} onChange={(e) => setId(e.target.value)} required />
                        <label>Tên vật phẩm:</label>
                        <input type="text" value={name} onChange={(e) => setName(e.target.value)} required />

                        <label>Loại vật phẩm:</label>
                        <select value={type} onChange={(e) => setType(e.target.value)} required>
                            <option value="" disabled>
                                Chọn thể loại
                            </option>
                            <option value="Trang phục">Trang phục</option>
                            <option value="Vũ khí">Vũ khí</option>
                            <option value="Rương">Rương</option>
                            <option value="Tiêu thụ">Tiêu thụ</option>
                            <option value="Chìa khoá">Chìa khoá</option>
                        </select>
                        <label>Giá:</label>
                        <input
                            type="number"
                            value={price}
                            onChange={(e) => setPrice(e.target.value)}
                            placeholder="Nhập giá vật phẩm"
                            required
                        />

                        <label>Giảm giá:</label>
                        <select value={discount} onChange={(e) => setDiscount(e.target.value)}>
                            <option value="" disabled>
                                Chọn giảm giá
                            </option>
                            <option value="0">0</option>
                            <option value="5">5%</option>
                            <option value="10">10%</option>
                            <option value="15">15%</option>
                            <option value="20">20%</option>
                            <option value="25">25%</option>
                            <option value="30">30%</option>
                            <option value="35">35%</option>
                            <option value="40">40%</option>
                            <option value="45">45%</option>
                            <option value="50">50%</option>
                        </select>

                        <label>Nội dung:</label>
                        <div className="editor-container">
                            <ReactQuill
                                ref={quillRef}
                                value={description}
                                onChange={(value) => setDescription(value)}
                                modules={modules}
                                formats={formats}
                            />
                        </div>

                        <div className="button-group">
                            <button type="submit" className="submit-btn">
                                {editingStore ? 'Cập nhật Vật Phẩm' : 'Lưu Vật Phẩm'}
                            </button>
                            <button type="button" className="close-btn" onClick={onClose}>
                                Đóng
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default StoreForm;
