import React, { useState, useEffect } from 'react';
import './StoreManager.css';
import StoreForm from './StoreForm';
import { fetchStores, deleteStore, updateStore } from '../../../services/api/storeManagementService';
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

function StoreManagement() {
    const [stores, setStores] = useState([]);
    const [filteredStores, setFilteredStores] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [editingStore, setEditingStore] = useState(null);
    const storesPerPage = 10;
    let toastShown = false;

    const loadStores = async (showToast = true) => {
        setLoading(true);
        try {
            const data = await fetchStores();
            const storesWithEmbeddedImages = data
                .map((store) => ({
                    ...store,
                    embeddedImages: store.EmbeddedImages ? JSON.parse(store.EmbeddedImages) : [],
                }))
                .sort((a, b) => new Date(b.Date) - new Date(a.Date));

            setStores(storesWithEmbeddedImages);
            setFilteredStores(storesWithEmbeddedImages);

            if (showToast && !toastShown) {
                toast.success('Hoàn thành tải vật phẩm!');
                toastShown = true;
            }
        } catch (error) {
            console.error('Lỗi khi tải danh sách vật phẩm:', error);
            toast.error('Không thể tải danh sách vật phẩm. Vui lòng thử lại sau.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadStores();
    }, []);

    const handleSaveStore = async () => {
        try {
            await loadStores();
            setCurrentPage(1);
            toast.success('Vật phẩm đã được lưu thành công!');
        } catch (error) {
            toast.error('Đã xảy ra lỗi khi lưu vật phẩm.');
        } finally {
            setIsFormOpen(false);
        }
    };

    const handleSearch = (e) => {
        setSearchTerm(e.target.value);
        const term = e.target.value.toLowerCase();
        const filtered = stores.filter(
            (store) =>
                store.ItemName.toLowerCase().includes(term) ||
                (store.ItemDescription && store.ItemDescription.toLowerCase().includes(term)),
        );
        setFilteredStores(filtered);
        setCurrentPage(1);
    };

    const handleDelete = async (itemId) => {
        if (window.confirm('Bạn có chắc chắn muốn xóa cửa hàng này?')) {
            try {
                await deleteStore(itemId);
                setStores(stores.filter(store => store.ItemId !== itemId));
                setFilteredStores(filteredStores.filter(store => store.ItemId !== itemId));
                toast.success('Cửa hàng đã được xóa thành công!');
            } catch (error) {
                toast.error('Có lỗi khi xóa cửa hàng!');
            }
        }
    };

    const handleEdit = (store) => {
        setEditingStore(store);
        setIsFormOpen(true);
    };

    const handleUpdateStore = async (itemId, updatedData) => {
        try {
            await updateStore(itemId, updatedData);
            await loadStores();
            toast.success('Vật phẩm đã được cập nhật thành công!');
        } catch (error) {
            toast.error('Đã xảy ra lỗi khi cập nhật vật phẩm.');
        } finally {
            setEditingStore(null);
            setIsFormOpen(false);
        }
    };

    const goToNextPage = () => {
        if (currentPage < totalPages) setCurrentPage(currentPage + 1);
    };

    const goToPreviousPage = () => {
        if (currentPage > 1) setCurrentPage(currentPage - 1);
    };

    const indexOfLastStore = currentPage * storesPerPage;
    const indexOfFirstStore = indexOfLastStore - storesPerPage;
    const currentStores = Array.isArray(filteredStores) ? filteredStores.slice(indexOfFirstStore, indexOfLastStore) : [];
    const totalPages = Math.ceil(filteredStores.length / storesPerPage);

    return (
        <div className="news-table-container">
            <ToastContainer autoClose={3000} position="top-right" />
            <div className="table-header">
                <input
                    type="text"
                    className="search-bar"
                    placeholder="Tìm kiếm vật phẩm..."
                    value={searchTerm}
                    onChange={handleSearch}
                />
                <button
                    className="add-post-btn"
                    onClick={() => {
                        setIsFormOpen(true);
                        setEditingStore(null);
                    }}
                >
                    Thêm vật phẩm
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
                                    <th>Id vật phẩm</th>
                                    <th>Ảnh</th>
                                    <th>Vật phẩm</th>
                                    <th>Nội dung</th>
                                    <th>Loại vật phẩm</th>
                                    <th>Giá</th>
                                    <th>Giảm Giá</th>
                                    <th>Thao tác</th>
                                </tr>
                            </thead>
                            <tbody>
                                {currentStores.length > 0 ? (
                                    currentStores.map((store, index) => {
                                        const serialNumber = indexOfFirstStore + index + 1;
                                        let base64Image = '';
                                        if (store.ItemImage && store.ItemImage.data) {
                                            const imageType = 'jpeg';
                                            base64Image = `data:itemImage/${imageType};base64,${arrayBufferToBase64(store.ItemImage.data)}`;
                                        }

                                        return (
                                            <tr key={index}>
                                                <td className="stt-column">{serialNumber}</td>
                                                <td className="title-column">{store.ItemId || 'Không có tiêu đề'}</td>
                                                <td className="post-image-column">
                                                    <img
                                                        src={base64Image || '/path/to/default/image.jpg'}
                                                        alt="Post"
                                                        className="post-image"
                                                    />
                                                </td>
                                                <td className="title-column">{store.ItemName || 'Không có tiêu đề'}</td>
                                                <td className="ItemDescription-column">
                                                    <span className="post-ItemDescription">
                                                        {store.ItemDescription
                                                            ? new DOMParser().parseFromString(store.ItemDescription, 'text/html').body.textContent
                                                            : 'Không có nội dung'}
                                                    </span>
                                                </td>
                                                <td className="title-column">{store.ItemType || 'chưa nhập loại vật phẩm'}</td>
                                                <td className="title-column">{store.ItemPrice || 'chưa nhập giá'}</td>
                                                <td className="title-column">{store.ItemDiscount || 'Không có giảm giá'}</td>
                                                <td className="actions-column">
                                                    <div className="action-buttons">
                                                        <button className="edit-btn" onClick={() => handleEdit(store)}>
                                                            Chỉnh sửa
                                                        </button>
                                                        <button
                                                            className="delete-btn"
                                                            onClick={() => handleDelete(store.ItemId)}
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
                                        <td colSpan="7">Không có vật phẩm nào</td>
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
                        vật phẩm: {filteredStores.length}/{stores.length}
                    </div>
                </div>
            )}

            <StoreForm
                isOpen={isFormOpen}
                onClose={() => setIsFormOpen(false)}
                onSave={handleSaveStore}
                editingStore={editingStore}
                onUpdate={handleUpdateStore}
            />
        </div>
    );
}

export default StoreManagement;
