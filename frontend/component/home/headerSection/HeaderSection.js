import React from 'react';
import './HeaderSection.css'; // Import CSS
import logoMain from '../../../assets/logo/logo-main.png';
import { FaDiscord, FaCalendarCheck, FaTelegram } from 'react-icons/fa';
import { FaCoins, FaBook } from 'react-icons/fa6';
import { IoMdDownload } from 'react-icons/io';

function HeaderSection() {
    return (
        <header className="header-section">
            <div className="logo-container">
                {/* Logo */}
                <img src={logoMain} className="logo_main" alt="Logo chính" />
            </div>
            <div className="btn-group">
                {/* Nút SỰ KIỆN */}
                {/* <a href="#trieu-hoi-anh-hung" className="button-header">
                    <span className="header_icons">
                        <FaCalendarCheck /> {/* Sử dụng React Icon 
                    </span>
                    TRIỆU HỒI ANH HÙNG
                </a> */}
                {/* Nút telegram */}
                <a
                    href="https://t.me/+OV-zd0ssYz0wNWI1"
                    className="button-header"
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    <span className="header_icons">
                        <FaTelegram />
                    </span>
                    TELEGRAM
                </a>
                {/* Nút DISCORD */}
                <a href="https://discord.gg/pBRMFfr2" className="button-header">
                    <span className="header_icons">
                        <FaDiscord />
                    </span>
                    DISCORD
                </a>
                {/* Nút DONATE */}
                <a href="/user/profile#topUpHongMoon" className="button-header">
                    <span className="header_icons">
                        <FaCoins />
                    </span>
                    DONATE
                </a>
                {/* Nút TẢI GAME */}
                <a
                    href="https://drive.google.com/drive/u/1/folders/1dlEbcp8W5hnPeegi3C1tCB4gRAPPgbFa"
                    className="button-header button-header-download"
                    target="_blank"
                    rel="noopener noreferrer" // Bảo mật khi mở tab mới
                >
                    <span className="header_icons">
                        <IoMdDownload />
                    </span>
                    TẢI GAME
                </a>
            </div>
        </header>
    );
}

export default HeaderSection;
