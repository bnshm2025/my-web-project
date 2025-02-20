import React, { useState } from 'react';

const RewardPopup = ({ rewardImages, rewardNames, username, creatureNames, onConfirm }) => {
    const [selectedCharacter, setSelectedCharacter] = useState('');

    const handleConfirm = () => {
        if (!selectedCharacter) {
            alert('Vui lòng chọn một nhân vật!');
            return;
        }
        onConfirm(selectedCharacter); // Gửi tên nhân vật đã chọn qua callback
    };

    return (
        <div>
            {/* Hình ảnh phần thưởng */}
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '10px', gap: '10px' }}>
                {rewardImages.map((image, index) => (
                    <img
                        key={index}
                        src={image}
                        alt={`Reward ${index + 1}`}
                        style={{
                            width: '70px',
                            height: '70px',
                            objectFit: 'contain',
                            borderRadius: '8px',
                            boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
                        }}
                    />
                ))}
            </div>

            {/* Thông báo chúc mừng */}
            <div style={{ textAlign: 'center', marginBottom: '10px' }}>
                <span>
                    Chúc mừng <strong>{username}</strong>, bạn đã nhận được:
                </span>
            </div>

            {/* Danh sách phần thưởng */}
            <div>
                <ul
                    style={{
                        textAlign: 'center',
                        margin: '10px 0',
                        padding: '0',
                        listStyleType: 'none',
                    }}
                >
                    {rewardNames.map((name, index) => (
                        <li
                            key={index}
                            style={{
                                marginBottom: '5px',
                                fontWeight: 'bold',
                            }}
                        >
                            {name}
                        </li>
                    ))}
                </ul>
            </div>

            {/* Danh sách tùy chọn (Select creatures) */}
            <div style={{ textAlign: 'center', marginTop: '20px' }}>
                <label htmlFor="creatureSelect" style={{ display: 'block', marginBottom: '10px' }}>
                    Chọn một nhân vật:
                </label>
                <select
                    id="creatureSelect"
                    value={selectedCharacter}
                    onChange={(e) => setSelectedCharacter(e.target.value)}
                    style={{
                        padding: '10px',
                        borderRadius: '5px',
                        fontSize: '16px',
                        width: '100%',
                        maxWidth: '300px',
                        margin: '0 auto',
                    }}
                    onClick={(e) => e.stopPropagation()} // Ngăn chặn sự kiện lan truyền
                >
                    <option value="" disabled>
                        -- Chọn nhân vật --
                    </option>
                    {creatureNames.map((name, index) => (
                        <option key={index} value={name}>
                            {name}
                        </option>
                    ))}
                </select>
                {/* Thông báo lưu ý */}
                <p
                    style={{
                        marginTop: '10px',
                        color: 'red',
                        fontSize: '14px',
                        zoom: '0.9',
                        fontWeight: 'bold',
                    }}
                >
                    Lưu ý: Mỗi Tài Khoản Chỉ Được Chọn Một Nhân Vật Để Nhận Thưởng.
                </p>
            </div>

            {/* Nút xác nhận */}
            <div style={{ textAlign: 'center', marginTop: '20px' }}>
                <button
                    onClick={handleConfirm}
                    style={{
                        padding: '10px 20px',
                        fontSize: '16px',
                        borderRadius: '5px',
                        cursor: 'pointer',
                        backgroundColor: '#f5e1a4',
                        color: '#333',
                        border: 'none',
                    }}
                >
                    Xác nhận
                </button>
            </div>
        </div>
    );
};

export default RewardPopup;
