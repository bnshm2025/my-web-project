import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom'; // Import useLocation
import {
    FaUserCircle,
    FaEnvelope,
    FaLock,
    FaGamepad,
    FaCoins,
    FaUser,
    FaCalendarAlt,
    FaPiggyBank,
    FaExchangeAlt,
} from 'react-icons/fa';
import './UserProfile.css';
import { getProfile } from '../../services/api/profileService';
import Menu from '../home/menu/Menu';
import HongMoonIcon from '../../assets/money/Hongmoon.png';
import DiamondIcon from '../../assets/money/Diamond.png';
import { FaArrowLeft, FaCopy, FaClipboardCheck } from 'react-icons/fa';
import PaymentScreen from './Payment/PaymentScreen';
import ChangePasswordModal from '../ChangePasswordPopup/ChangePasswordPopup';
import ChangeEmailModal from '../ChangeEmailPopup/ChangeEmailPopup';
import { jwtDecode } from 'jwt-decode';
import { depositRequest } from '../../services/api/exchangehmcoinService';
import { spendHMCoin } from '../../services/api/transactionsService';

function UserProfile() {
    const navigate = useNavigate();
    const location = useLocation(); // Lấy thông tin URL hiện tại
    const [profile, setProfile] = useState(null);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState('security');
    const [username, setUsername] = useState(null);
    const [showTabs, setShowTabs] = useState(true);
    const [isResponsive, setIsResponsive] = useState(false);
    const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
    const [isChangePasswordModalOpen, setIsChangePasswordModalOpen] = useState(false);
    const [isChangeEmailModalOpen, setIsChangeEmailModalOpen] = useState(false);
    const [currentEmail, setCurrentEmail] = useState(''); // Email hiện tại của user
    const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);

    const [amount, setAmount] = useState('');
    const [depositResult, setDepositResult] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isError, setIsError] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);

    const handleDeposit = async () => {
        if (isProcessing) {
            alert('Vui lòng đợi giao dịch trước hoàn tất.');
            return; // Ngừng nếu đang có giao dịch đang xử lý
        }
        if (!amount) {
            alert('Vui lòng nhập số HongMoon Coin cần quy đổi');
            return;
        }

        if (!profile?.UserId) {
            setErrorMessage('Không tìm thấy UserId');
            return;
        }

        if (isNaN(amount) || amount <= 0) {
            alert('Vui lòng nhập một số tiền hợp lệ');
            return;
        }

        // Kiểm tra nếu số tiền nạp vượt quá số dư HongMoonCoin
        if (Number(amount) > profile.hongMoonCoin) {
            alert('Không đủ HongMoon Coin.');
            return;
        }

        setIsLoading(true);
        setIsError(false);

        const numericAmount = Number(amount) * 1000; // Nhân số tiền với 1.000 khi gửi request

        let retryCount = 0; // Đếm số lần thử lại
        const maxRetries = 3; // Giới hạn số lần thử lại
        const retryDelay = 3000; // Thời gian trì hoãn giữa các lần thử lại (3 giây)

        while (retryCount < maxRetries) {
            try {
                // 1. Gọi hàm depositRequest để nạp tiền vào tài khoản
                const depositResult = await depositRequest(profile.UserId, numericAmount);

                if (depositResult.success) {
                    setDepositResult(depositResult.data); // Lưu trữ dữ liệu thành công từ kết quả trả về
                    setAmount('');

                    // 2. Gọi hàm spendHMCoin để trừ đi số tiền nạp từ hongMoonCoin
                    const spendResult = await spendHMCoin(profile.UserId, amount);

                    if (spendResult.error) {
                        setIsError(true);
                        setErrorMessage(spendResult.error);
                        return;
                    }

                    // Cập nhật số lượng HongMoonCoin sau khi trừ
                    const newHongMoonCoin = profile.hongMoonCoin - Number(amount);

                    // Cập nhật totalBalance
                    const newTotalBalance = profile.totalBalance + numericAmount;

                    // Cập nhật lại thông tin profile với hongMoonCoin và totalBalance mới
                    setProfile((prevProfile) => ({
                        ...prevProfile,
                        hongMoonCoin: newHongMoonCoin, // Trừ số tiền quy đổi
                        totalBalance: newTotalBalance, // Cập nhật totalBalance
                    }));

                    alert('Quy Đổi Thành Công!!!');
                    break; // Thành công, thoát khỏi vòng lặp
                } else {
                    // Nếu không thành công, kiểm tra thông báo lỗi từ API
                    if (depositResult.message === 'Vui lòng đợi 1 chút trước khi tiếp tục quy đổi.....') {
                        retryCount++; // Tăng số lần thử lại
                        if (retryCount < maxRetries) {
                            await new Promise((resolve) => setTimeout(resolve, retryDelay)); // Delay trước khi thử lại
                        } else {
                            alert('Đã vượt quá số lần thử lại, vui lòng thử lại sau.');
                            break; // Nếu đã thử tối đa số lần, thoát vòng lặp
                        }
                    } else {
                        setIsError(true);
                        setErrorMessage(depositResult.message || 'Có lỗi xảy ra khi quy đổi');
                        break; // Thoát vòng lặp nếu gặp lỗi khác
                    }
                }
            } catch (error) {
                console.error('Lỗi khi gọi depositRequest hoặc spendHMCoin:', error);
                setIsError(true);
                setErrorMessage('Đã có lỗi xảy ra, vui lòng thử lại sau.');

                // Nếu có lỗi liên quan đến việc yêu cầu quy đổi, chúng ta sẽ thử lại sau 3 giây
                retryCount++;
                if (retryCount < maxRetries) {
                    console.log(`Thử lại lần ${retryCount}...`);
                    await new Promise((resolve) => setTimeout(resolve, retryDelay)); // Delay 3 giây
                } else {
                    alert('Đã vượt quá số lần thử lại, vui lòng thử lại sau.');
                    break; // Nếu đã thử tối đa số lần, thoát vòng lặp
                }
            } finally {
                setIsLoading(false);
            }
        }
    };

    useEffect(() => {
        // Cập nhật activeTab dựa trên fragment trong URL
        const tabFromUrl = location.hash.replace('#', '') || 'security'; // Lấy phần hash từ URL
        setActiveTab(tabFromUrl);
    }, [location.hash]); // Mỗi khi URL thay đổi (có thay đổi hash)

    useEffect(() => {
        const handleResize = () => {
            const isNowResponsive = window.innerWidth <= 1270;
            setIsResponsive(isNowResponsive);
            if (!isNowResponsive) {
                setShowTabs(true);
            }
        };

        handleResize();
        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    useEffect(() => {
        const tokenMatch = document.cookie.match(/authToken=([^;]+)/);

        if (!tokenMatch) {
            navigate('/user/signin');
            return;
        }

        const token = tokenMatch[1];
        const decodedToken = jwtDecode(token);
        setUsername(decodedToken.username);

        // Nếu chưa có thông tin, không thực hiện yêu cầu API
        if (!decodedToken.username) return;

        // Hàm gọi API để lấy dữ liệu người dùng
        const fetchProfileData = async () => {
            try {
                const data = await getProfile(decodedToken.username);
                setProfile(data); // Cập nhật state sau khi nhận dữ liệu
            } catch (err) {
                console.error('Error loading profile:', err);
                // Gọi lại ngay lập tức khi gặp lỗi, không hiển thị thông báo lỗi
                fetchProfileData();
            }
        };

        fetchProfileData(); // Gọi API lần đầu tiên
    }, [navigate]);

    const isDisabled = true;

    if (error) return <p>{error}</p>;
    if (!profile) return null;

    const renderContent = () => {
        switch (activeTab) {
            case 'security':
                return (
                    <div className="up-profile-section up-animate-fade">
                        <h3>
                            <FaLock /> Bảo Mật
                        </h3>
                        <div className="security-info">
                            <div className="security-section">
                                <div className="security-section-title">
                                    <FaUser /> Thay Đổi Mật Khẩu
                                </div>
                                <button className="security-button" onClick={() => setIsPasswordModalOpen(true)}>
                                    Đổi Mật Khẩu
                                </button>
                            </div>
                            <div className="security-section">
                                <div className="security-section-title">
                                    <FaUser /> Thay Đổi Gmail
                                </div>
                                <button className="security-button" onClick={() => setIsEmailModalOpen(true)}>
                                    Đổi Gmail
                                </button>
                            </div>
                        </div>
                        <ChangePasswordModal
                            isOpen={isPasswordModalOpen}
                            onClose={() => setIsPasswordModalOpen(false)}
                            userEmail={profile?.Email || ''}
                        />
                        <ChangeEmailModal
                            isOpen={isEmailModalOpen}
                            onClose={handleCloseEmailModal}
                            currentEmail={profile?.Email || ''}
                        />
                    </div>
                );
            case 'characterInfo':
                return (
                    <div className="up-profile-section up-animate-fade">
                        <h3>
                            <FaGamepad /> Thông Tin Nhân Vật
                        </h3>
                        {profile.creatures && profile.creatures.length > 0 ? (
                            profile.creatures.map((creature, index) => (
                                <div key={index} className="up-creature-info-box">
                                    <div className="up-creature-info">
                                        <p>
                                            <strong>Tên Nhân Vật:</strong> {creature.name}
                                        </p>
                                        <p>
                                            <strong>Chủng Tộc:</strong> {creature.race}
                                        </p>
                                        <p>
                                            <strong>Giới Tính:</strong> {creature.sex}
                                        </p>
                                        <p>
                                            <strong>Vai Trò:</strong> {creature.job}
                                        </p>
                                        <p>
                                            <strong>Cấp Độ:</strong> {creature.level}
                                        </p>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p>Người dùng không có nhân vật nào</p>
                        )}
                    </div>
                );
            case 'deposits':
                return (
                    <div className="up-profile-section up-animate-fade">
                        <h3>
                            <FaCoins /> Lịch Sử Giao Dịch
                        </h3>
                        {profile.transactionHistory && profile.transactionHistory.length > 0 ? (
                            <div className="up-deposits-table-container">
                                <table className="up-deposits-table">
                                    <thead>
                                        <tr>
                                            <th>Tên Người Dùng</th>
                                            <th>Thông Tin</th>
                                            <th>Số Tiền</th>
                                            <th>Ngày Tạo</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {profile.transactionHistory
                                            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)) // Sắp xếp theo ngày giảm dần
                                            .map((transaction, index) => (
                                                <tr key={index}>
                                                    <td>{transaction.userName}</td>
                                                    <td>{transaction.addInfo}</td>
                                                    <td>{transaction.amount}</td>
                                                    <td>
                                                        {new Date(transaction.createdAt).toLocaleDateString('vi-VN', {
                                                            day: '2-digit',
                                                            month: '2-digit',
                                                            year: 'numeric', // Hiển thị đầy đủ 4 số của năm
                                                        })}
                                                    </td>
                                                </tr>
                                            ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <p>Không có lịch sử giao dịch.</p>
                        )}
                    </div>
                );

            case 'topUpHongMoon':
                return (
                    <div className="up-profile-section up-animate-fade">
                        <PaymentScreen />
                    </div>
                );
            case 'currencyExchange':
                return (
                    <div className="up-profile-section up-animate-fade">
                        <h3>
                            <FaExchangeAlt /> Quy Đổi HongMoon
                        </h3>
                        <div className="up-deposit-form">
                            <input
                                type="number"
                                placeholder="Nhập số HongMoon Coin cần quy đổi..."
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                            />

                            <div className="exchange-rate">
                                <span className="rate-label">Tỷ lệ : </span>
                                <span>
                                    1
                                    <img
                                        src={HongMoonIcon}
                                        title="HongMoonCoin"
                                        alt="HongMoon Icon"
                                        className="user-profile-icon"
                                    />
                                    = 1000
                                    <img
                                        src={DiamondIcon}
                                        title="Kim Cương"
                                        alt="Diamond Icon"
                                        className="user-profile-icon"
                                    />
                                </span>
                            </div>

                            <button onClick={handleDeposit} disabled={isLoading} className="deposit-button">
                                {isLoading ? 'Đang xử lý...' : 'Quy Đổi'}
                            </button>

                            {isError && <p className="error-message">{errorMessage}</p>}
                            {depositResult && !isError && (
                                <p className="success-message">
                                    Nạp tiền thành công! Deposit ID: {depositResult.depositId}
                                </p>
                            )}
                        </div>
                    </div>
                );

            default:
                return null;
        }
    };

    const handleTabClick = (tab) => {
        setActiveTab(tab);
        if (isResponsive) {
            setShowTabs(false);
        }
        // Cập nhật URL khi chọn tab
        navigate(`#${tab}`);
    };

    const handleBackClick = () => {
        setShowTabs(true);
    };

    const handleOpenEmailModal = () => setIsEmailModalOpen(true);
    const handleCloseEmailModal = () => setIsEmailModalOpen(false);

    return (
        <>
            <Menu isStatic />
            <div className="user-profile-background">
                <div className="user-profile-container">
                    <div className="user-profile-left">
                        <div className="user-profile-avatar-section">
                            <FaUserCircle className="user-profile-avatar-icon" />
                            <p className="user-profile-user-name">{profile?.UserName || 'N/A'}</p>
                            <div className="user-profile-currency-section">
                                <span className="currency-item">
                                    <img
                                        src={HongMoonIcon}
                                        title="HongMoonCoin"
                                        alt="HongMoon Icon"
                                        className="user-profile-icon"
                                    />
                                    {profile.hongMoonCoin || 0}
                                </span>
                                <span className="currency-item">
                                    <img
                                        src={DiamondIcon}
                                        title="Kim Cương"
                                        alt="Diamond Icon"
                                        className="user-profile-icon"
                                    />
                                    {profile.totalBalance || 0}
                                </span>
                            </div>
                        </div>
                        <div className="user-profile-personal-info">
                            <div className="personal-info-item">
                                <FaEnvelope className="info-icon" />
                                <span className="info-text">{profile?.Email || 'N/A'}</span>
                            </div>
                            <div className="personal-info-item">
                                <FaCalendarAlt className="info-icon" />
                                <span className="info-text">
                                    Ngày tạo:{' '}
                                    {profile?.Created ? new Date(profile.Created).toLocaleDateString() : 'N/A'}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="user-profile-right">
                        {isResponsive ? (
                            showTabs ? (
                                <div className="user-profile-tabs">
                                    <button
                                        className={
                                            activeTab === 'security' ? 'user-profile-tab active' : 'user-profile-tab'
                                        }
                                        onClick={() => handleTabClick('security')}
                                    >
                                        <FaLock /> Bảo Mật
                                    </button>
                                    <button
                                        className={
                                            activeTab === 'characterInfo'
                                                ? 'user-profile-tab active'
                                                : 'user-profile-tab'
                                        }
                                        onClick={() => handleTabClick('characterInfo')}
                                    >
                                        <FaGamepad /> Thông Tin Nhân Vật
                                    </button>
                                    <button
                                        className={
                                            activeTab === 'deposits' ? 'user-profile-tab active' : 'user-profile-tab'
                                        }
                                        onClick={() => handleTabClick('deposits')}
                                    >
                                        <FaCoins /> Lịch Sử Giao Dịch
                                    </button>
                                    <button
                                        className={
                                            activeTab === 'topUpHongMoon'
                                                ? 'user-profile-tab active'
                                                : 'user-profile-tab'
                                        }
                                        onClick={() => handleTabClick('topUpHongMoon')}
                                    >
                                        <FaPiggyBank /> Donate HongMoon
                                    </button>
                                    <button
                                        className={
                                            activeTab === 'currencyExchange'
                                                ? 'user-profile-tab active'
                                                : 'user-profile-tab'
                                        }
                                        onClick={() => handleTabClick('currencyExchange')}
                                    >
                                        <FaExchangeAlt /> Quy Đổi HongMoon
                                    </button>
                                </div>
                            ) : (
                                <div className="user-profile-tab-content">
                                    <button className="back-button" onClick={handleBackClick}>
                                        <FaArrowLeft />
                                    </button>
                                    {renderContent()}
                                </div>
                            )
                        ) : (
                            <>
                                <div className="user-profile-tabs">
                                    <button
                                        className={
                                            activeTab === 'security' ? 'user-profile-tab active' : 'user-profile-tab'
                                        }
                                        onClick={() => handleTabClick('security')}
                                    >
                                        <FaLock /> Bảo Mật
                                    </button>
                                    <button
                                        className={
                                            activeTab === 'characterInfo'
                                                ? 'user-profile-tab active'
                                                : 'user-profile-tab'
                                        }
                                        onClick={() => handleTabClick('characterInfo')}
                                    >
                                        <FaGamepad /> Thông Tin Nhân Vật
                                    </button>
                                    <button
                                        className={
                                            activeTab === 'deposits' ? 'user-profile-tab active' : 'user-profile-tab'
                                        }
                                        onClick={() => handleTabClick('deposits')}
                                    >
                                        <FaCoins /> Lịch Sử Giao Dịch
                                    </button>

                                    <button
                                        className={
                                            activeTab === 'topUpHongMoon'
                                                ? 'user-profile-tab active'
                                                : 'user-profile-tab'
                                        }
                                        onClick={() => handleTabClick('topUpHongMoon')}
                                    >
                                        <FaPiggyBank /> Donate HongMoon
                                    </button>
                                    <button
                                        className={
                                            activeTab === 'currencyExchange'
                                                ? 'user-profile-tab active'
                                                : 'user-profile-tab'
                                        }
                                        onClick={() => handleTabClick('currencyExchange')}
                                    >
                                        <FaExchangeAlt /> Quy Đổi HongMoon
                                    </button>
                                </div>
                                <div className="user-profile-tab-content">{renderContent()}</div>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}

export default UserProfile;
