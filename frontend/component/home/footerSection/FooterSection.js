import React from 'react';
import './FooterSection.css';
import { FaFacebookF, FaDiscord, FaTelegram } from 'react-icons/fa';
import logo from '../../../assets/logo/bns-logo.png';
import { useNavigate } from 'react-router-dom';

function FooterSection() {
    const navigate = useNavigate();

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
        <footer className="footer-section">
            <div className="footer-content">
                <div className="footer-logo">
                    <img src={logo} alt="Game XYZ Logo" />
                </div>
                <div className="footer-links">
                    <a href="/">TRANG CHỦ</a>
                    <a href="#donate">DONATE</a>
                    <a href="news">TIN TỨC</a>
                    <a onClick={handleIntroduceClick} style={{ cursor: 'pointer' }}>
                        GIỚI THIỆU
                    </a>
                </div>
                <div className="footer-social">
                    <a
                        href="https://www.facebook.com/profile.php?id=61567494682969"
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        <FaFacebookF />
                    </a>
                    <a href="https://discord.gg/NFPN8rMKDN">
                        <FaDiscord />
                    </a>
                    <a href="https://t.me/+OV-zd0ssYz0wNWI1">
                        <FaTelegram />
                    </a>
                </div>
            </div>
            <div className="footer-bottom">
                <p>© 2025 [BNS 911Cafe]. All rights reserved.</p>
            </div>
        </footer>
    );
}

export default FooterSection;
