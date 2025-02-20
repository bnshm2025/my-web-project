import React, { useState, useEffect } from 'react';
import './EventSection.css';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

// Import các hình ảnh
import Event1 from '../../../assets/event/event_day1.png';
import Item2 from '../../../assets/event/20141.png';
import Grocery from '../../../assets/event/Grocery.png';
import Gather from '../../../assets/event/Gather.png';
import Client from '../../../assets/event/Client.png';
import Client_31 from '../../../assets/event/Client_31.png';
import Client_K2 from '../../../assets/event/Client_K2.png';
import Client_KA from '../../../assets/event/Client_KA.png';
import Grocery_CNBM from '../../../assets/event/Grocery_CNBM.png';
import snapedit from '../../../assets/event/snapedit.png';
import Bg_items_top_left from '../../../assets/event/bg_items_top_left.png';
import Bg_items_top_right from '../../../assets/event/bg_items_top_right.png';
import Bg_items_bottom_left from '../../../assets/event/bg_items_bottom_left.png';
import Bg_items_bottom_right from '../../../assets/event/bg_items_bottom_right.png';
import Cloud_top_left from '../../../assets/event/cloud_top_left.png';
import Cloud_top_right from '../../../assets/event/Cloud_top_right.png';
import Text_title_event from '../../../assets/event/text_title_event.png';
import Event_logo from '../../../assets/event/event_logo.png';
import RewardPopup from './RewardPopup';
import { getProfile } from '../../../services/api/profileService';
import { sendItem } from '../../../services/api/sendItemsService';
import { claimReward, checkRewardStatus } from '../../../services/api/evTHAHService';

// Ánh xạ tên phần thưởng tới itemID
const rewardItemIDs = {
    'Thánh Y Cầu Phúc': [{ id: 2094751, quantity: 1 }],
    'Hộp Vũ Khí Huyễn Hồ Điệp': [{ id: 2028117, quantity: 1 }],
    'Bột Mài Tinh Luyện Kim Loại': [{ id: 4000054, quantity: 1 }],
    'Búa Ngọc x20': [{ id: 2021843, quantity: 20 }],
    'Bùa Hồi Sinh x20': [{ id: 2080001, quantity: 20 }],
    'Kết Tinh Đá Biến Đổi x50': [{ id: 2036132, quantity: 50 }],
    'Gỗ tím x8': [{ id: 829815, quantity: 16 }],
    'Bùa Hồi Sinh Tổ Đội x4': [{ id: 2080000, quantity: 4 }],
    'Pháp Luân': [{ id: 2092743, quantity: 1 }],
};

function EventSection() {
    const navigate = useNavigate();
    const [popupContent, setPopupContent] = useState(null);
    const [rewardStatus, setRewardStatus] = useState({});
    const eventStartDate = new Date('2025-01-01T00:01:00');

    // Ngày nhận thưởng
    const isRewardAvailable = (rewardDay) => {
        const currentDate = new Date();
        const rewardDate = new Date(eventStartDate);
        rewardDate.setDate(eventStartDate.getDate() + rewardDay - 1); // Ngày nhận của phần thưởng
        return currentDate >= rewardDate; // Kiểm tra nếu đã đến ngày nhận
    };

    const getRewardDate = (rewardDay) => {
        const rewardDate = new Date(eventStartDate);
        rewardDate.setDate(eventStartDate.getDate() + rewardDay - 1);

        const day = String(rewardDate.getDate()).padStart(2, '0'); // Lấy ngày và đảm bảo 2 chữ số
        const month = String(rewardDate.getMonth() + 1).padStart(2, '0'); // Lấy tháng (bắt đầu từ 0) và đảm bảo 2 chữ số

        return `${day}/${month}`; // Định dạng dd/MM
    };

    // Lấy token xác thực
    const getTokenAndDecode = () => {
        const tokenMatch = document.cookie.match(/authToken=([^;]+)/);
        if (!tokenMatch) {
            return null; // Không tìm thấy token
        }
        const token = tokenMatch[1];
        try {
            const decodedToken = jwtDecode(token);
            return decodedToken; // Trả về token đã giải mã
        } catch (error) {
            console.error('Lỗi khi giải mã token:', error);
            return null; // Token không hợp lệ
        }
    };

    // Kiểm tra trạng thái nhận thưởng cho tất cả các ngày
    useEffect(() => {
        const fetchRewardStatus = async () => {
            const decodedToken = getTokenAndDecode();
            if (!decodedToken || !decodedToken.id) {
                return;
            }

            const statuses = {};
            for (let day = 1; day <= 7; day++) {
                try {
                    const status = await checkRewardStatus(decodedToken.id, day);
                    statuses[day] = status.claimed || false;
                } catch (error) {
                    console.error(`Lỗi khi kiểm tra trạng thái nhận thưởng ngày ${day}:`, error);
                    statuses[day] = false;
                }
            }
            setRewardStatus(statuses); // Cập nhật trạng thái
        };

        fetchRewardStatus();
    }, []);

    // Hàm xử lý khi nhấn nhận phần thưởng
    const handleClaimReward = async (rewardNames, rewardImages, rewardDay) => {
        const decodedToken = getTokenAndDecode();
        if (!decodedToken || !decodedToken.username) {
            navigate('/user/signin');
            return;
        }

        try {
            // Kiểm tra trạng thái phần thưởng từ backend
            const rewardStatus = await checkRewardStatus(decodedToken.id, rewardDay);
            if (rewardStatus.claimed) {
                alert('Phần thưởng này đã được nhận!');
                return; // Ngừng thực hiện nếu phần thưởng đã được nhận
            }

            // Lấy thông tin profile
            const profileData = await getProfile(decodedToken.username);
            const creatureNames = Array.isArray(profileData.creatures)
                ? profileData.creatures.map((creature) => creature.name)
                : [];

            if (creatureNames.length === 0) {
                console.warn('Không tìm thấy danh sách creatures trong profileData.');
            }

            // Lấy danh sách itemID và số lượng từ rewardNames
            const items = rewardNames.flatMap((name) => rewardItemIDs[name] || []);
            const itemDetails = items.filter((item) => item.id !== null); // Loại bỏ các mục không có ID

            // Hiển thị popup với thông tin nhận thưởng
            setPopupContent(
                <RewardPopup
                    rewardImages={rewardImages}
                    rewardNames={rewardNames}
                    username={decodedToken.username}
                    creatureNames={creatureNames}
                    onConfirm={async (selectedCharacter) => {
                        try {
                            // Kiểm tra trạng thái phần thưởng lại trước khi gửi đồ
                            const updatedRewardStatus = await checkRewardStatus(decodedToken.id, rewardDay);
                            if (updatedRewardStatus.claimed) {
                                alert('Phần thưởng này đã được nhận trước đó!');
                                return; // Ngừng xử lý nếu phần thưởng đã được nhận
                            }

                            // Gửi vật phẩm với số lượng cụ thể
                            await handleSendItems(selectedCharacter, itemDetails);

                            // Nhận thưởng
                            await handleSendReward(decodedToken.id, rewardDay, selectedCharacter);

                            // Cập nhật trạng thái ngay sau khi nhận thưởng thành công
                            setRewardStatus((prevStatus) => ({
                                ...prevStatus,
                                [rewardDay]: true,
                            }));

                            alert('Nhận thưởng thành công!');
                        } catch (error) {
                            console.error('Lỗi khi gửi vật phẩm hoặc nhận thưởng:', error);
                            alert('Lỗi: ' + (error.message || 'Không xác định'));
                        } finally {
                            // Đóng popup sau khi xử lý xong
                            setPopupContent(null);
                        }
                    }}
                />,
            );
        } catch (error) {
            console.error('Lỗi khi xử lý handleClaimReward:', error);
            alert('Đã xảy ra lỗi khi nhận phần thưởng. Vui lòng thử lại!');
        }
    };

    const handleSendReward = async (userId, rewardDay, selectedCharacter) => {
        try {
            const response = await claimReward(userId, rewardDay, selectedCharacter);

            return response; // Trả về kết quả để sử dụng tiếp
        } catch (error) {
            console.error('Lỗi khi nhận thưởng:', error);
            throw new Error('Lỗi khi nhận thưởng: ' + error.message);
        }
    };

    // Hàm gửi đồ
    const handleSendItems = async (charname, itemDetails) => {
        try {
            for (const item of itemDetails) {
                await sendItem(charname, item.id, item.quantity); // Gửi item với số lượng cụ thể
            }
            setPopupContent(null); // Đóng popup
        } catch (error) {
            console.error('Lỗi khi gửi item:', error.message);
            alert(`Lỗi: ${error.message}`);
        }
    };

    const closePopup = () => {
        setPopupContent(null);
    };

    return (
        <section id="trieu-hoi-anh-hung" className="event-section">
            <div className="event-content">
                <div className="event-header">
                    <img src={Event_logo} className="event_logo" alt="Event_logo" />
                    <img src={Cloud_top_left} className="cloud_top_left" alt="Cloud_top_left" />
                    <img src={Cloud_top_right} className="cloud_top_right" alt="Cloud_top_right" />
                    <img src={Text_title_event} className="text_title_event" alt="Text_title_event" />
                </div>
                <div className="bg_character">
                    <div className="bg_cloud"></div>
                </div>
                <div className="event-list">
                    <img src={Bg_items_top_left} className="bg_items_top_left" alt="Bg_items_top_left" />
                    <img src={Bg_items_top_right} className="bg_items_top_right" alt="Bg_items_top_right" />
                    <img src={Bg_items_bottom_left} className="bg_items_bottom_left" alt="Bg_items_bottom_left" />
                    <img src={Bg_items_bottom_right} className="bg_items_bottom_right" alt="Bg_items_bottom_right" />
                    <div className="event-items">
                        <div
                            className={`items-cart items-bg1 ${
                                rewardStatus[1] ? 'claimed disabled' : isRewardAvailable(1) ? '' : 'not-available'
                            }`}
                            onClick={() =>
                                isRewardAvailable(1) &&
                                !rewardStatus[1] && // Chỉ cho phép nếu đã đến ngày và chưa nhận
                                handleClaimReward(
                                    ['Thánh Y Cầu Phúc', 'Hộp Vũ Khí Huyễn Hồ Điệp', 'Bột Mài Tinh Luyện Kim Loại'],
                                    [Event1],
                                    1,
                                )
                            }
                        >
                            <div className="reward-date">
                                <span>{getRewardDate(1)}</span>
                            </div>
                            <div className="items-bg">
                                <div className="items">
                                    <img src={Event1} className="img_items" alt="Thánh Y Cầu Phúc" />
                                </div>
                            </div>
                            <div className="receive-items">
                                <span>{rewardStatus[1] ? 'Đã nhận' : isRewardAvailable(1) ? 'NHẬN' : ''}</span>
                            </div>
                        </div>

                        <div
                            className={`items-cart items-bg1 ${
                                rewardStatus[2] ? 'claimed disabled' : isRewardAvailable(2) ? '' : 'not-available'
                            }`}
                            onClick={() =>
                                isRewardAvailable(2) &&
                                !rewardStatus[2] &&
                                handleClaimReward(['Búa Ngọc x20'], [Item2], 2)
                            }
                        >
                            <div className="reward-date">
                                <span>{getRewardDate(2)}</span>
                            </div>
                            <div className="items-bg">
                                <div className="items">
                                    <img src={Item2} className="img_items2" alt="Búa Ngọc x20" />
                                </div>
                            </div>
                            <div className="receive-items">
                                <span>{rewardStatus[2] ? 'Đã nhận' : isRewardAvailable(2) ? 'NHẬN' : ''}</span>
                            </div>
                        </div>

                        <div
                            className={`items-cart items-bg2 ${
                                rewardStatus[3] ? 'claimed disabled' : isRewardAvailable(3) ? '' : 'not-available'
                            }`}
                            onClick={() =>
                                isRewardAvailable(3) &&
                                !rewardStatus[3] &&
                                handleClaimReward(['Bùa Hồi Sinh x20'], [Grocery], 3)
                            }
                        >
                            <div className="reward-date">
                                <span>{getRewardDate(3)}</span>
                            </div>
                            <div className="items-bg">
                                <div className="items">
                                    <img src={Grocery} className="img_items3" alt="Bùa Hồi Sinh x20" />
                                </div>
                            </div>
                            <div className="receive-items">
                                <span>{rewardStatus[3] ? 'Đã nhận' : isRewardAvailable(3) ? 'NHẬN' : ''}</span>
                            </div>
                        </div>

                        <div
                            className={`items-cart items-bg2 ${
                                rewardStatus[4] ? 'claimed disabled' : isRewardAvailable(4) ? '' : 'not-available'
                            }`}
                            onClick={() =>
                                isRewardAvailable(4) &&
                                !rewardStatus[4] &&
                                handleClaimReward(['Kết Tinh Đá Biến Đổi x50'], [Gather], 4)
                            }
                        >
                            <div className="reward-date">
                                <span>{getRewardDate(4)}</span>
                            </div>
                            <div className="items-bg">
                                <div className="items">
                                    <img src={Gather} className="img_items4" alt="Kết Tinh Đá Biến Đổi x50" />
                                </div>
                            </div>
                            <div className="receive-items">
                                <span>{rewardStatus[4] ? 'Đã nhận' : isRewardAvailable(4) ? 'NHẬN' : ''}</span>
                            </div>
                        </div>

                        <div
                            className={`items-cart items-bg2 ${
                                rewardStatus[5] ? 'claimed disabled' : isRewardAvailable(5) ? '' : 'not-available'
                            }`}
                            onClick={
                                () =>
                                    isRewardAvailable(5) &&
                                    !rewardStatus[5] &&
                                    handleClaimReward(['Gỗ tím x8'], [Gather], 5) // Cập nhật phần thưởng và hình ảnh
                            }
                        >
                            <div className="reward-date">
                                <span>{getRewardDate(5)}</span>
                            </div>
                            <div className="items-bg">
                                <div className="items">
                                    <img src={Client} className="img_items5" alt="Gỗ tím x8" />{' '}
                                    {/* Cập nhật hình ảnh */}
                                </div>
                            </div>
                            <div className="receive-items">
                                <span>{rewardStatus[5] ? 'Đã nhận' : isRewardAvailable(5) ? 'NHẬN' : ''}</span>
                            </div>
                        </div>

                        <div
                            className={`items-cart items-bg1 ${
                                rewardStatus[6] ? 'claimed disabled' : isRewardAvailable(6) ? '' : 'not-available'
                            }`}
                            onClick={() =>
                                isRewardAvailable(6) &&
                                !rewardStatus[6] &&
                                handleClaimReward(['Bùa Hồi Sinh Tổ Đội x4'], [Grocery_CNBM], 6)
                            }
                        >
                            <div className="reward-date">
                                <span>{getRewardDate(6)}</span>
                            </div>
                            <div className="items-bg">
                                <div className="items">
                                    <img src={Grocery_CNBM} className="img_items3" alt="Bùa Hồi Sinh Tổ Đội x4" />
                                </div>
                            </div>
                            <div className="receive-items">
                                <span>{rewardStatus[6] ? 'Đã nhận' : isRewardAvailable(6) ? 'NHẬN' : ''}</span>
                            </div>
                        </div>
                    </div>
                    <div className="event-god">
                        <div
                            className={`items-cart-god ${
                                rewardStatus[7] ? 'claimed disabled' : isRewardAvailable(7) ? '' : 'not-available'
                            }`}
                            onClick={() =>
                                isRewardAvailable(7) &&
                                !rewardStatus[7] && // Chỉ cho phép nếu đã đến ngày và chưa nhận
                                handleClaimReward(['Pháp Luân'], [snapedit], 7)
                            }
                        >
                            <div className="reward-date-god">
                                <span>{getRewardDate(7)}</span>
                            </div>
                            <div className="items-god">
                                <div className="items">
                                    <img src={snapedit} className="img_items-god" alt="Pháp Luân" />
                                </div>
                            </div>
                            <div className="receive-items-god">
                                <span>{rewardStatus[7] ? 'Đã nhận' : isRewardAvailable(7) ? 'NHẬN' : ''}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {/* Popup */}
            {popupContent && (
                <div className="ev-popup-overlay" onClick={closePopup}>
                    <div className="ev-popup">
                        {popupContent} {/* Loại bỏ thẻ <p> */}
                    </div>
                </div>
            )}
        </section>
    );
}

export default EventSection;
