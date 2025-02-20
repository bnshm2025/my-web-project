import React, { useEffect, useState } from 'react';
import './EventConvertHMC.css';
import logo from '../../../assets/logo/logo-main.png';
import frameTopRight from '../../../assets/eventconvert/goctrenbenphai.png';
import frameBottomRight from '../../../assets/eventconvert/gocduoibenphai.png';
import frameTopLeft from '../../../assets/eventconvert/goctrenbentrai.png';
import frameBottomLeft from '../../../assets/eventconvert/gocduoibentrai.png';
import elNhanQua from '../../../assets/eventconvert/elnhanquapng.png';
import iconItem1 from '../../../assets/eventconvert/vehonqua123.png';
import iconItem2 from '../../../assets/eventconvert/dongholinhngocx50.png';
import iconItem3 from '../../../assets/eventconvert/tchmtnn.png';
import hmcicon from '../../../assets/money/Hongmoon.png';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import { getDepositInfo } from '../../../services/api/addDepositService';

function EventConvertHMC() {
    const navigate = useNavigate();
    const [depositInfo, setDepositInfo] = useState(null); // Lưu thông tin khoản nạp
    const [isTokenValid, setIsTokenValid] = useState(true);

    // Hàm kiểm tra token
    const checkToken = () => {
        const tokenMatch = document.cookie.match(/authToken=([^;]+)/);
        // console.log('Cookie:', document.cookie); // Log toàn bộ cookie
        if (!tokenMatch) {
            console.warn('Không tìm thấy authToken trong cookie.');
            return null;
        }
        const token = tokenMatch[1];
        // console.log('authToken:', token); // Log giá trị của authToken
        try {
            const decodedToken = jwtDecode(token);
            // console.log('Token đã giải mã:', decodedToken); // Log token đã giải mã
            if (decodedToken.exp * 1000 < Date.now()) {
                console.warn('authToken đã hết hạn.');
                return null;
            }
            return decodedToken;
        } catch (error) {
            console.error('Lỗi khi giải mã authToken:', error);
            return null;
        }
    };

    // Gọi API lấy thông tin khoản nạp
    useEffect(() => {
        if (!isTokenValid) {
            console.warn('Token không hợp lệ. Dừng gọi API.');
            return;
        }

        const fetchDepositInfo = async () => {
            const decodedToken = checkToken();
            if (!decodedToken || !decodedToken.id) {
                console.warn('Token không hợp lệ hoặc không chứa userId.');
                return;
            }

            const userId = decodedToken.id;
            // console.log('userId:', userId);

            try {
                const data = await getDepositInfo(userId);
                // console.log('Dữ liệu deposits:', data.deposits);

                if (!data.deposits || data.deposits.length === 0) {
                    console.warn('Không có khoản nạp nào.');
                    return;
                }

                // Tính tổng số tiền từ trường `Amount`
                const total = data.deposits.reduce((sum, deposit) => {
                    const amount = parseFloat(deposit.Amount) || 0; // Chuyển `Amount` thành số
                    return sum + amount;
                }, 0);

                // console.log('Tổng số tiền:', total); // In tổng số tiền ra console
            } catch (error) {
                console.error('Lỗi khi gọi API getDepositInfo:', error);
            }
        };

        fetchDepositInfo();
    }, [isTokenValid]);

    // Hàm xử lý bấm "Nhận"
    const handleReceiveReward = () => {
        if (!checkToken()) {
            navigate('/user/signin'); // Điều hướng đến trang đăng nhập nếu token không hợp lệ
            return;
        }
        alert('Đang xử lý nhận thưởng...');
        // Thêm logic xử lý nhận thưởng tại đây
    };

    // Hàm xử lý bấm "Donate Ngay"
    const handleDonate = () => {
        if (!checkToken()) {
            navigate('/user/signin'); // Điều hướng đến trang đăng nhập nếu token không hợp lệ
            return;
        }
        navigate('/user/profile#topUpHongMoon'); // Điều hướng đến trang nạp Hongmoon nếu token hợp lệ
    };

    return (
        <section className="ec-event-convert-section">
            <div className="ec-left-column">
                <img src={logo} alt="Logo" className="ec-overlay-logo" />
                <div className="ec-overlay-box">
                    <img src={frameTopRight} alt="Frame Top Right" className="ec-overlay-frame-top-right" />
                    <img src={frameBottomRight} alt="Frame Bottom Right" className="ec-overlay-frame-bottom-right" />
                    <img src={frameTopLeft} alt="Frame Top Left" className="ec-overlay-frame-top-left" />
                    <img src={frameBottomLeft} alt="Frame Bottom Left" className="ec-overlay-frame-bottom-left" />
                    <div className="ec-images-row">
                        <div className="ec-image-item-frame">
                            <div className="ec-frame-number-container">
                                <p className="ec-frame-number">500</p>
                                <img src={hmcicon} alt="HMC Icon" className="ec-frame-number-icon" />
                            </div>
                            <img src={elNhanQua} alt="Background Item 1" className="ec-image-item-background" />
                            <img src={iconItem1} alt="Icon 1" className="ec-icon-item" />
                            <p className="ec-icon-caption">GÓI VỆ HỒN QUẠ 1,2,3</p>
                            <button className="ec-receive-button" onClick={handleReceiveReward}>
                                NHẬN
                            </button>
                        </div>
                        <div className="ec-image-item-frame">
                            <div className="ec-frame-number-container">
                                <p className="ec-frame-number">1000</p>
                                <img src={hmcicon} alt="HMC Icon" className="ec-frame-number-icon" />
                            </div>
                            <img src={elNhanQua} alt="Background Item 2" className="ec-image-item-background" />
                            <img src={iconItem2} alt="Icon 2" className="ec-icon-item" />
                            <p className="ec-icon-caption">ĐỒNG HỒ LINH NGỌC</p>
                            <button className="ec-receive-button" onClick={handleReceiveReward}>
                                NHẬN
                            </button>
                        </div>
                        <div className="ec-image-item-frame">
                            <div className="ec-frame-number-container">
                                <p className="ec-frame-number">2000</p>
                                <img src={hmcicon} alt="HMC Icon" className="ec-frame-number-icon" />
                            </div>
                            <img src={elNhanQua} alt="Background Item 3" className="ec-image-item-background" />
                            <img src={iconItem3} alt="Icon 3" className="ec-icon-item" />
                            <p className="ec-icon-caption">
                                THÁI CỰC HỒNG MÔN THẠCH
                                <br />
                                NGẪU NHIÊN
                            </p>
                            <button className="ec-receive-button" onClick={handleReceiveReward}>
                                NHẬN
                            </button>
                        </div>
                    </div>
                    <h1 className="ec-accumulate-text">TÍCH LŨY HONGMOON</h1>
                    <h2 className="ec-claim-text">NHẬN QUÀ NGAY</h2>
                    <p className="ec-date-text">01/01 - 30/01</p>
                    <button className="ec-topup-button" onClick={handleDonate}>
                        DONATE NGAY
                    </button>
                </div>
            </div>
            <div className="ec-right-column"></div>
        </section>
    );
}

export default EventConvertHMC;
