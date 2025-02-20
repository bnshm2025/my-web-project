import React, { useEffect, useState } from 'react';
import './Menu.css';
import logomenu from '../../../assets/logo/logo-bns.png';
import { ImSearch } from 'react-icons/im';
import { FaLock, FaFacebook, FaDiscord, FaTelegram } from 'react-icons/fa';
import { MdOutlineMenu } from 'react-icons/md';
import Modal from 'react-modal';
import { jwtDecode } from 'jwt-decode';
import { useNavigate } from 'react-router-dom';

// Hàm hỗ trợ lấy cookie theo tên
function getCookie(name) {
    const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
    return match ? decodeURIComponent(match[2]) : null;
}

function Menu({ isStatic }) {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [isSupportDropdownOpen, setIsSupportDropdownOpen] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
    const [isResponsive, setIsResponsive] = useState(window.innerWidth <= 1173); // Responsive mode

    const [keyword, setKeyword] = useState('');

    const handleSearch = () => {
        if (keyword.trim()) {
            // Điều hướng tới trang tìm kiếm với từ khóa
            navigate(`/search?keyword=${encodeURIComponent(keyword)}`);
        }
    };

    const [user, setUser] = useState(() => {
        const token = getCookie('authToken');
        if (token) {
            try {
                return jwtDecode(token);
            } catch (error) {
                console.error('Token không hợp lệ:', error);
                return null;
            }
        }
        return null;
    });

    const navigate = useNavigate();

    useEffect(() => {
        const handleResize = () => {
            setIsResponsive(window.innerWidth <= 1173);
            setIsDropdownOpen(false); // Đóng dropdown khi resize
            setIsSupportDropdownOpen(false);
        };

        const handleScroll = () => setIsScrolled(window.scrollY > 0);

        window.addEventListener('resize', handleResize);
        window.addEventListener('scroll', handleScroll);

        return () => {
            window.removeEventListener('resize', handleResize);
            window.removeEventListener('scroll', handleScroll);
        };
    }, []);

    const toggleMenu = () => setIsMenuOpen((prev) => !prev);

    const handleDropdownToggle = () => {
        if (isResponsive) {
            setIsDropdownOpen((prev) => !prev);
        }
    };

    const handleDropdownHoverEnter = () => {
        if (!isResponsive) {
            setIsDropdownOpen(true);
        }
    };

    const handleDropdownHoverLeave = () => {
        if (!isResponsive) {
            setIsDropdownOpen(false);
        }
    };

    const handleSupportDropdownToggle = () => {
        if (isResponsive) {
            setIsSupportDropdownOpen((prev) => !prev);
        }
    };

    const handleSupportDropdownHoverEnter = () => {
        if (!isResponsive) {
            setIsSupportDropdownOpen(true);
        }
    };

    const handleSupportDropdownHoverLeave = () => {
        if (!isResponsive) {
            setIsSupportDropdownOpen(false);
        }
    };

    const closeModal = () => setIsModalOpen(false);

    const handleHomeClick = () => {
        window.location.href = '/';
    };

    const handleNewsClick = () => {
        navigate('/news');
    };

    const handleStoreClick = () => {
        navigate('/store'); // Điều hướng đến trang cửa hàng
    };

    const handleLogout = () => {
        document.cookie = 'authToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
        setUser(null);
        setIsUserDropdownOpen(false);
        navigate('/user/signin');
    };

    const handleIntroduceClick = () => {
        navigate('/');
        setTimeout(() => {
            const introduceSection = document.getElementById('introduce');
            if (introduceSection) {
                introduceSection.scrollIntoView({ behavior: 'smooth' });
            }
        }, 100);
    };

    return (
        <>
            <nav className={`menu ${isStatic ? 'menu-static' : ''} ${isScrolled ? 'scrolled' : ''} `}>
                {/* Logo */}
                <div className="menu-logo" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
                    <img src={logomenu} alt="Logo menu" />
                </div>
                {/* Menu Items */}
                <ul className={`menu-options ${isMenuOpen ? 'show' : ''}`}>
                    <div className="menu-options-nav">
                        <li onClick={handleHomeClick} style={{ cursor: 'pointer' }}>
                            TRANG CHỦ
                        </li>
                        <li onClick={handleNewsClick} style={{ cursor: 'pointer' }}>
                            TIN TỨC
                        </li>
                        <li
                            onClick={handleDropdownToggle}
                            onMouseEnter={handleDropdownHoverEnter}
                            onMouseLeave={handleDropdownHoverLeave}
                            style={{ position: 'relative', cursor: 'pointer' }}
                            aria-expanded={isDropdownOpen}
                        >
                            {/* CỬA HÀNG
                             <ul className={`dropdown-menu ${isDr0opdownOpen ? 'show' : ''}`}>
                                 onClick={() => setIsModalOpen(true)}

                                <li className="dropdown-item" onClick={handleStoreClick}>
                                    <FaLock className="lock-icon" /> Cửa hàng hồng môn
                                </li>
                                <li className="dropdown-item" onClick={() => setIsModalOpen(true)}>
                                    <FaLock className="lock-icon" /> Mua bán tài khoản
                                </li>
                            </ul> */}
                        </li>
                        <li onClick={handleIntroduceClick} style={{ cursor: 'pointer' }}>
                            GIỚI THIỆU
                        </li>
                        <li
                            onClick={handleSupportDropdownToggle}
                            onMouseEnter={handleSupportDropdownHoverEnter}
                            onMouseLeave={handleSupportDropdownHoverLeave}
                            style={{ position: 'relative', cursor: 'pointer' }}
                            aria-expanded={isSupportDropdownOpen}
                        >
                            HỖ TRỢ
                            <ul className={`dropdown-menu ${isSupportDropdownOpen ? 'show' : ''}`}>
                                <li className="dropdown-item">
                                    <a
                                        href="https://www.facebook.com/profile.php?id=61567494682969"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >
                                        <FaFacebook className="lock-icon" /> Facebook
                                    </a>
                                </li>
                                <li className="dropdown-item">
                                    <a href="https://discord.gg/ZWkXzXdBBn" target="_blank" rel="noopener noreferrer">
                                        <FaDiscord className="lock-icon" /> Discord
                                    </a>
                                </li>
                                <li className="dropdown-item">
                                    <a href="link-telegram" target="_blank" rel="noopener noreferrer">
                                        <FaTelegram className="lock-icon" /> Telegram
                                    </a>
                                </li>
                            </ul>
                        </li>
                        {user ? (
                            <li
                                onClick={() => setIsUserDropdownOpen((prev) => !prev)}
                                style={{ position: 'relative', cursor: 'pointer' }}
                                aria-expanded={isUserDropdownOpen}
                            >
                                #{user.username}
                                <ul className={`dropdown-menu ${isUserDropdownOpen ? 'show' : ''}`}>
                                    <li className="dropdown-item" onClick={() => navigate('/user/profile')}>
                                        Thông Tin Cá Nhân
                                    </li>
                                    <li className="dropdown-item" onClick={handleLogout}>
                                        Đăng Xuất
                                    </li>
                                </ul>
                            </li>
                        ) : (
                            <li onClick={() => navigate('/user/signin')} style={{ cursor: 'pointer' }}>
                                ĐĂNG NHẬP
                            </li>
                        )}
                    </div>

                    <div className="menu-options-nav-search">
                        <li className="search-mobile">
                            <div className="menu-search-box">
                                <ImSearch className="search-icon" onClick={handleSearch} />
                                <input
                                    type="text"
                                    placeholder="Tìm kiếm..."
                                    className="search-input"
                                    value={keyword}
                                    onChange={(e) => setKeyword(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') handleSearch(); // Tìm kiếm khi nhấn Enter
                                    }}
                                />
                            </div>
                        </li>
                    </div>
                </ul>

                <button className="menu-toggle" onClick={toggleMenu}>
                    <MdOutlineMenu />
                </button>
            </nav>

            <Modal
                isOpen={isModalOpen}
                onRequestClose={closeModal}
                contentLabel="Coming Soon"
                className="modal"
                overlayClassName="modal-overlay"
            >
                <h2>COMING SOON</h2>
                <p>Tính năng này hiện đang được phát triển và sẽ sớm ra mắt.</p>
                <button onClick={closeModal} className="modal-close-button">
                    Đóng
                </button>
            </Modal>
            {isMenuOpen && <div className={`overlay ${isMenuOpen ? 'show' : ''}`} onClick={toggleMenu}></div>}
        </>
    );
}

export default Menu;
