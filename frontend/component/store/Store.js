import React, { useState, useEffect } from 'react';
import './Store.css';
import { fetchStores } from '../../services/api/storeManagementService';
import Menu from '../home/menu/Menu';
import FooterSection from '../home/footerSection/FooterSection';
import HMCoin from '../../assets/money/Hongmoon.png';
import { FaSearch, FaTimes } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import { getProfile } from '../../services/api/profileService';
import { ClipLoader } from 'react-spinners';
import { spendHMCoin } from '../../services/api/transactionsService';
import { sendItem } from '../../services/api/sendItemsService';

function arrayBufferToBase64(buffer) {
    let binary = '';
    const bytes = new Uint8Array(buffer);
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
}

function Store() {
    const [stores, setStores] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedTab, setSelectedTab] = useState('new'); // Trạng thái tab chính

    const [selectedProduct, setSelectedProduct] = useState(null); // Trạng thái modal
    const [showModal, setShowModal] = useState(false); // Hiển thị modal

    const [quantity, setQuantity] = useState(1); // Quantity state for selected product

    const [searchTerm, setSearchTerm] = useState('');
    const [filteredStores, setFilteredStores] = useState([]);
    const [searchVisible, setSearchVisible] = useState(false);
    const [characters, setCharacters] = useState([]); // Danh sách nhân vật
    const [selectedCharacter, setSelectedCharacter] = useState(null);
    const [loadingCharacters, setLoadingCharacters] = useState(false);
    const [hongMoonCoin, setHongMoonCoin] = useState(0); // Số dư HMCoin
    const navigate = useNavigate();

    const getTokenAndDecode = () => {
        const tokenMatch = document.cookie.match(/authToken=([^;]+)/);
        if (!tokenMatch) {
            console.warn('authToken chưa được thiết lập.');
            return null; // Không tìm thấy token
        }
        const token = tokenMatch[1];
        try {
            const decodedToken = jwtDecode(token);
            // console.log('Decoded token:', decodedToken); // Kiểm tra token
            return decodedToken;
        } catch (error) {
            console.error('Lỗi khi giải mã token:', error);
            return null; // Token không hợp lệ
        }
    };
    // Hàm tải dữ liệu từ API
    const loadStores = async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await fetchStores();
            const parsedData = data.map((item) => ({
                id: item.ItemId,
                name: item.ItemName,
                date: new Date(item.Date), // Chuyển đổi sang kiểu Date để sắp xếp chính xác
                description: item.ItemDescription,
                price: item.ItemPrice,
                discount: item.ItemDiscount || 0, // Giảm giá
                type: item.ItemType,
                img: `data:image/jpeg;base64,${arrayBufferToBase64(item.ItemImage.data)}`,
            }));

            // Sắp xếp theo ngày giảm dần
            parsedData.sort((a, b) => b.date - a.date);

            setStores(parsedData);
            setFilteredStores(parsedData); // Cập nhật danh sách sản phẩm đã lọc
        } catch (err) {
            setError('Lỗi khi tải dữ liệu từ API.');
        } finally {
            setLoading(false);
        }
    };

    // Gọi API khi component được mount
    useEffect(() => {
        loadStores();
    }, []);

    const handleSearch = (e) => {
        setSearchTerm(e.target.value);
        const term = e.target.value.toLowerCase();
        const filtered = stores.filter(
            (store) =>
                store.name.toLowerCase().includes(term) ||
                (store.description && store.description.toLowerCase().includes(term)),
        );
        setFilteredStores(filtered);
    };

    // Toggle việc hiển thị input tìm kiếm
    const toggleSearch = () => {
        setSearchVisible(!searchVisible);
        if (searchVisible) {
            setSearchTerm(''); // Xóa kết quả tìm kiếm khi đóng input
        }
    };

    // Lọc sản phẩm theo tab
    const filteredStoresByTab = filteredStores.filter((store) => {
        if (selectedTab === 'new') return true;
        if (selectedTab === 'skins') return store.type === 'Trang phục';
        if (selectedTab === 'weapons') return store.type === 'Vũ khí';
        if (selectedTab === 'chest') return store.type === 'Rương';
        if (selectedTab === 'consume') return store.type === 'Tiêu thụ';
        if (selectedTab === 'key') return store.type === 'Chìa khoá';
        if (selectedTab === 'vips') return store.type === 3;
        if (selectedTab === 'vip') return store.type === 4;
        return true;
    });

    // Lấy danh sách nhân vật
    const loadCharacters = async (retryCount = 0) => {
        setLoadingCharacters(true); // Bắt đầu trạng thái tải
        const decodedToken = getTokenAndDecode();
        if (!decodedToken || !decodedToken.username) {
            console.warn('Token không hợp lệ hoặc thiếu username.');
            setLoadingCharacters(false);
            return;
        }

        try {
            // console.log('Gọi API với username:', decodedToken.username);
            const profileData = await getProfile(decodedToken.username);

            if (!profileData || !Array.isArray(profileData.creatures) || profileData.creatures.length === 0) {
                console.warn('Không tìm thấy danh sách nhân vật trong profileData.');

                if (retryCount < 5) {
                    // console.log(`Thử tải lại (lần ${retryCount + 1})...`);
                    setTimeout(() => loadCharacters(retryCount + 1), 1000); // Thử lại sau 1 giây
                } else {
                    console.error('Không thể tải danh sách nhân vật sau 5 lần thử.');
                    setCharacters([]);
                    setLoadingCharacters(false); // Kết thúc tải sau khi thất bại
                }
            } else {
                const creatureNames = profileData.creatures.map((creature) => creature.name);
                // console.log('Danh sách nhân vật:', creatureNames);

                setCharacters(creatureNames); // Cập nhật danh sách nhân vật
                setSelectedCharacter(''); // Để trống trạng thái nhân vật đã chọn, yêu cầu người dùng chọn
                setLoadingCharacters(false); // Kết thúc tải sau khi thành công
            }
        } catch (error) {
            console.error('Lỗi khi tải danh sách nhân vật:', error);

            if (retryCount < 5) {
                // console.log(`Thử tải lại (lần ${retryCount + 1})...`);
                setTimeout(() => loadCharacters(retryCount + 1), 1000); // Thử lại sau 1 giây
            } else {
                console.error('Không thể tải danh sách nhân vật sau 5 lần thử.');
                setCharacters([]);
                setLoadingCharacters(false); // Kết thúc tải sau khi thất bại
            }
        }
    };

    // Hiển thị modal khi click vào sản phẩm
    const handleProductClick = async (product) => {
        setSelectedProduct(product);
        setShowModal(true);

        // Gọi loadCharacters khi mở modal
        try {
            await loadCharacters();

            // Gọi API để lấy thông tin số dư HMCoin
            const decodedToken = getTokenAndDecode();
            if (decodedToken && decodedToken.username) {
                const profileData = await getProfile(decodedToken.username);
                if (profileData && profileData.hongMoonCoin !== undefined) {
                    setHongMoonCoin(profileData.hongMoonCoin); // Lưu số dư vào state
                } else {
                    console.warn('Không tìm thấy số dư Hồng Môn Coin trong profile.');
                    setHongMoonCoin(0);
                }
            }
        } catch (error) {
            console.error('Lỗi khi lấy thông tin số dư Hồng Môn Coin:', error);
            setHongMoonCoin(0);
        }
    };

    // Đóng modal
    const handleCloseModal = () => {
        setShowModal(false);
        setSelectedProduct(null);
    };

    // Thay đổi số lượng sản phẩm
    const handleQuantityChange = (e) => {
        const newQuantity = parseInt(e.target.value, 10);
        setSelectedProduct((prevProduct) => ({
            ...prevProduct,
            quantity: newQuantity, // Default to 1 if input is invalid
        }));
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('vi-VN').format(amount); // Định dạng số theo chuẩn Việt Nam
    };

    const calculateTotal = () => {
        const quantity = selectedProduct.quantity || 1;
        const price = selectedProduct.price || 0;

        const discount = selectedProduct.discount || 0;

        const discountedPrice = price - (price * discount) / 100; // Tính giá sau giảm giá
        return formatCurrency(quantity * discountedPrice); // Áp dụng định dạng tiền vào tổng số sau khi giảm giá
    };

    const handleBuy = async () => {
        const decodedToken = getTokenAndDecode();
        if (!decodedToken) {
            navigate('/user/signin'); // Token không hợp lệ, điều hướng người dùng đến trang đăng nhập
            return;
        }

        if (!selectedCharacter) {
            alert('Vui lòng chọn nhân vật trước khi mua.');
            return;
        }

        try {
            // Gọi API để lấy thông tin người dùng
            const profileData = await getProfile(decodedToken.username);

            if (!profileData || profileData.hongMoonCoin === undefined) {
                alert('Không thể lấy thông tin số dư Hồng Môn Coin của bạn. Vui lòng thử lại!');
                return;
            }

            const hongMoonCoin = profileData.hongMoonCoin;
            // console.log(`Số dư Hồng Môn Coin hiện tại: ${hongMoonCoin}`);

            const totalPrice = selectedProduct.price * (selectedProduct.quantity || 1);

            // Kiểm tra xem số dư có đủ không
            if (hongMoonCoin < totalPrice) {
                alert('Số dư Hồng Môn Coin không đủ để thực hiện giao dịch.');
                return;
            }

            // Gửi vật phẩm
            try {
                const itemResponse = await sendItem(
                    selectedCharacter,
                    selectedProduct.id,
                    selectedProduct.quantity || 1,
                );
                // console.log('Gửi vật phẩm thành công:', itemResponse);
            } catch (itemError) {
                console.error('Lỗi khi gửi vật phẩm:', itemError);
                alert('Gửi vật phẩm thất bại. Vui lòng thử lại sau hoặc liên hệ hỗ trợ!');
                return;
            }

            // Tiêu HMCoin
            try {
                const spendResponse = await spendHMCoin(decodedToken.id, totalPrice);
                if (spendResponse.error) {
                    alert(spendResponse.error); // Thông báo lỗi từ backend
                    return;
                }
                // console.log(
                //     `Mua hàng thành công: ${selectedProduct.name}, Tổng giá: ${totalPrice}, Số dư sau giao dịch: ${spendResponse.remainingHMCoin}`,
                // );

                // Cập nhật số dư frontend
                setHongMoonCoin(spendResponse.remainingHMCoin);
            } catch (spendError) {
                console.error('Lỗi khi tiêu HMCoin:', spendError);
                alert('Không thể hoàn tất giao dịch. Vui lòng thử lại sau hoặc liên hệ hỗ trợ!');
                return;
            }

            // Thông báo thành công nếu tất cả đều hoàn tất
            alert('Mua hàng thành công!');

            // Đóng modal sau khi hoàn tất xử lý
            handleCloseModal();
        } catch (error) {
            console.error('Lỗi khi thực hiện mua hàng:', error);
            alert('Đã xảy ra lỗi không mong muốn. Vui lòng thử lại sau!');
        }
    };

    return (
        <>
            <Menu isStatic />
            <div className="store-container">
                {/* Banner Section */}
                <div className="store-banner">
                    <div className="banner-content">
                        <h1>Cửa hàng Hồng Môn</h1>
                        <p>Khám phá các vật phẩm trong cửa hàng Hồng Môn!</p>
                    </div>
                </div>

                {/* Tìm kiếm với icon */}
                <div className="store-search">
                    <div className="search-bar">
                        <button
                            className="btn-search-icon"
                            onClick={toggleSearch} // Khi click vào icon sẽ hiển thị input
                        >
                            {/* {searchVisible ? <FaTimes /> : <FaSearch />} Đổi icon tùy theo trạng thái thêm icon x để đóng*/}

                            <FaSearch />
                        </button>
                        {searchVisible && (
                            <input
                                type="text"
                                className="search-ip"
                                placeholder="Tìm kiếm vật phẩm..."
                                value={searchTerm}
                                onChange={handleSearch}
                            />
                        )}
                    </div>
                </div>

                {/* Tab Section */}
                <div className="tab-container">
                    <div
                        className={`tab ${selectedTab === 'new' ? 'active' : ''}`}
                        onClick={() => setSelectedTab('new')}
                    >
                        TẤT CẢ
                    </div>
                    <div
                        className={`tab ${
                            selectedTab === 'skins' ||
                            selectedTab === 'weapons' ||
                            selectedTab === 'chest' ||
                            selectedTab === 'consume' ||
                            selectedTab === 'key'
                                ? 'active'
                                : ''
                        }`}
                        onClick={() => setSelectedTab('skins')} // Mặc định hiển thị Loại 1
                    >
                        VẬT PHẨM
                    </div>

                    <div
                        className={`tab ${selectedTab === 'vips' || selectedTab === 'vip' ? 'active' : ''}`}
                        onClick={() => setSelectedTab('vips')} // Mặc định hiển thị Loại 1
                    >
                        THÀNH VIÊN
                    </div>
                </div>

                {/* Sub-Tab Section (hiển thị khi chọn phân loại) */}
                {(selectedTab === 'skins' ||
                    selectedTab === 'weapons' ||
                    selectedTab === 'chest' ||
                    selectedTab === 'consume' ||
                    selectedTab === 'key') && (
                    <div className="sub-tab-container">
                        <div
                            className={`sub-tab ${selectedTab === 'skins' ? 'active' : ''}`}
                            onClick={() => setSelectedTab('skins')}
                        >
                            Trang Phục
                        </div>
                        <div
                            className={`sub-tab ${selectedTab === 'weapons' ? 'active' : ''}`}
                            onClick={() => setSelectedTab('weapons')}
                        >
                            Vũ Khí
                        </div>
                        <div
                            className={`sub-tab ${selectedTab === 'chest' ? 'active' : ''}`}
                            onClick={() => setSelectedTab('chest')}
                        >
                            Rương
                        </div>
                        <div
                            className={`sub-tab ${selectedTab === 'consume' ? 'active' : ''}`}
                            onClick={() => setSelectedTab('consume')}
                        >
                            Tiêu Thụ
                        </div>
                        <div
                            className={`sub-tab ${selectedTab === 'key' ? 'active' : ''}`}
                            onClick={() => setSelectedTab('key')}
                        >
                            Chìa Khoá
                        </div>
                    </div>
                )}

                {/* Sub-Tab Section (hiển thị khi chọn phân loại) */}
                {(selectedTab === 'vips' || selectedTab === 'vip') && (
                    <div className="sub-tab-container">
                        <div
                            className={`sub-tab ${selectedTab === 'vips' ? 'active' : ''}`}
                            onClick={() => setSelectedTab('vips')}
                        >
                            Đăng Ký
                        </div>
                        <div
                            className={`sub-tab ${selectedTab === 'vip' ? 'active' : ''}`}
                            onClick={() => setSelectedTab('vip')}
                        >
                            Cá Nhân
                        </div>
                    </div>
                )}

                {/* Sản phẩm theo tab */}
                <div className="products-section">
                    {loading ? (
                        <p className="products-message">Đang tải...</p>
                    ) : error ? (
                        <p className="error-message">{error}</p>
                    ) : filteredStoresByTab.length === 0 ? (
                        <p className="products-message">Không có sản phẩm nào.</p>
                    ) : (
                        <div className="products">
                            {filteredStoresByTab.map((item) => (
                                <div key={item.id} className="product-card" onClick={() => handleProductClick(item)}>
                                    {item.discount > 0 && (
                                        <div className="product-discout">
                                            <span className="product-discout-percent">{item.discount}%</span>
                                            <span className="product-discout-lable">GIẢM</span>
                                        </div>
                                    )}
                                    <div className="product-group-card-content">
                                        <div className="product-card-content">
                                            <img src={item.img} alt={item.name} />
                                            <span className="product-name">{item.name}</span>
                                        </div>
                                        <div className="product-card-price">
                                            {/* <p>{formatCurrency(item.price)}</p> */}
                                            <img className="img_hongmoon-coin" src={HMCoin} />
                                            <p>
                                                <span className="discount-price">
                                                    {item.discount > 0
                                                        ? formatCurrency(
                                                              item.price - (item.price * item.discount) / 100,
                                                          )
                                                        : formatCurrency(item.price)}
                                                </span>
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Modal */}
            {showModal && selectedProduct && (
                <div className="modal-overlay" onClick={handleCloseModal}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <span className="modal-close" onClick={handleCloseModal}>
                            &times;
                        </span>
                        <div className="modal-group-left">
                            <img src={selectedProduct.img} alt={selectedProduct.name} />
                        </div>
                        <div className="modal-group-right">
                            <div className="modal-group-right-content">
                                <h2>{selectedProduct.name}</h2>
                                <div className="modal-group-price modal-group-right-items">
                                    <img className="img_hongmoon-coin" src={HMCoin} />
                                    <p>{formatCurrency(selectedProduct.price)}</p>
                                </div>
                                <div className="modal-group-right-items">
                                    <p>
                                        <span className="text-bold">Thông tin:</span>{' '}
                                        {selectedProduct.description
                                            ? new DOMParser().parseFromString(selectedProduct.description, 'text/html')
                                                  .body.textContent
                                            : 'Không có nội dung'}
                                    </p>
                                </div>

                                {/* Phần nhập số lượng */}
                                <div className="quantity-container modal-group-right-items">
                                    <label htmlFor="quantity" className="text-bold">
                                        Số lượng:
                                    </label>
                                    <div className="quantity-controls">
                                        <p>{selectedProduct.name}</p>
                                        <div className="quantity-controls-ip">
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    setSelectedProduct((prevProduct) => ({
                                                        ...prevProduct,
                                                        quantity: Math.max((prevProduct.quantity || 1) - 1, 1),
                                                    }))
                                                }
                                            >
                                                -
                                            </button>
                                            <input
                                                className="quantity-input"
                                                id="quantity"
                                                type="number"
                                                value={selectedProduct.quantity || 1}
                                                onChange={handleQuantityChange} // Allow user input
                                            />
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    setSelectedProduct((prevProduct) => ({
                                                        ...prevProduct,
                                                        quantity: (prevProduct.quantity || 1) + 1,
                                                    }))
                                                }
                                            >
                                                +
                                            </button>
                                        </div>
                                    </div>
                                </div>
                                {/* Dropdown chọn nhân vật */}
                                <div className="modal-group-right-items">
                                    <label htmlFor="character-select" className="text-bold">
                                        Chọn nhân vật:
                                    </label>
                                    {loadingCharacters ? (
                                        // Hiển thị ClipLoader khi đang tải
                                        <div className="loading-container">
                                            <ClipLoader size={20} color="#007bff" loading={true} />
                                        </div>
                                    ) : (
                                        // Hiển thị dropdown khi đã tải xong
                                        <select
                                            id="character-select"
                                            value={selectedCharacter || ''} // Hiển thị placeholder nếu chưa chọn
                                            onChange={(e) => setSelectedCharacter(e.target.value)}
                                            className="character-select"
                                        >
                                            {/* Placeholder tùy chọn đầu tiên */}
                                            <option value="" disabled>
                                                --- Chọn nhân vật ---
                                            </option>
                                            {characters.length > 0 ? (
                                                characters.map((character, index) => (
                                                    <option key={index} value={character}>
                                                        {character}
                                                    </option>
                                                ))
                                            ) : (
                                                <option value="" disabled>
                                                    Không tìm thấy nhân vật nào
                                                </option>
                                            )}
                                        </select>
                                    )}
                                </div>
                            </div>
                            <div className="modal-group-right-checkout">
                                {/* Hiển thị số dư HMCoin */}
                                <div className="modal-group-price total-balance">
                                    <span className="text-bold">Số dư: </span>
                                    <img className="img_hongmoon-coin" src={HMCoin} alt="HMCoin" />
                                    <span>{hongMoonCoin}</span>
                                </div>

                                <hr className="divider" />

                                {/* Hiển thị tổng giá */}
                                <div className="modal-group-price total-price">
                                    <span className="text-bold">Tổng giá: </span>
                                    <img className="img_hongmoon-coin" src={HMCoin} alt="HMCoin" />
                                    {calculateTotal()}
                                </div>

                                {/* Nút mua hàng */}
                                <button className="buy-button" onClick={handleBuy}>
                                    Mua ngay
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            <FooterSection />
        </>
    );
}

export default Store;
