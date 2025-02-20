import React, { useState } from 'react';
import { FaTimes, FaCheckCircle } from 'react-icons/fa';
import { toast } from 'react-toastify';
import ReCAPTCHA from "react-google-recaptcha";
import changeEmailService from '../../services/api/changeEmailService';
import { sendChangeEmailOTP, verifyCode } from '../../services/api/emailService';
import './ChangeEmailPopup.css';

function ChangeEmailModal({ isOpen, onClose, currentEmail }) {
    const [newEmail, setNewEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [captchaToken, setCaptchaToken] = useState(null);

    const [isSendingCurrentOTP, setIsSendingCurrentOTP] = useState(false);
    const [isSendingNewOTP, setIsSendingNewOTP] = useState(false);
    
    // State cho email cũ
    const [currentEmailVerificationCode, setCurrentEmailVerificationCode] = useState('');
    const [isCurrentEmailOTPSent, setIsCurrentEmailOTPSent] = useState(false);
    const [isCurrentEmailVerified, setIsCurrentEmailVerified] = useState(false);
    const [currentEmailCooldown, setCurrentEmailCooldown] = useState(0);
    
    // State cho email mới
    const [newEmailVerificationCode, setNewEmailVerificationCode] = useState('');
    const [isNewEmailOTPSent, setIsNewEmailOTPSent] = useState(false);
    const [isNewEmailVerified, setIsNewEmailVerified] = useState(false);
    const [newEmailCooldown, setNewEmailCooldown] = useState(0);

    const handleCaptchaChange = (token) => {
        setCaptchaToken(token);
    };

    const startCooldown = (setterFunction) => {
        setterFunction(60);
        const timer = setInterval(() => {
            setterFunction((prev) => {
                if (prev <= 1) {
                    clearInterval(timer);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
    };

    // Xử lý gửi OTP cho email hiện tại
    const handleSendCurrentEmailOTP = async () => {
        setIsSendingCurrentOTP(true);
        try {
            await sendChangeEmailOTP(currentEmail);
            toast.success('Mã OTP đã được gửi đến email hiện tại của bạn!');
            setIsCurrentEmailOTPSent(true);
            startCooldown(setCurrentEmailCooldown);
        } catch (error) {
            toast.error(error.message || 'Không thể gửi mã OTP. Vui lòng thử lại.');
        } finally {
            setIsSendingCurrentOTP(false);
        }
    };

    // Xử lý xác thực OTP cho email hiện tại
    const handleVerifyCurrentEmailOTP = async () => {
        try {
            const result = await verifyCode(currentEmail, currentEmailVerificationCode);
            if (result.message === 'Mã xác nhận chính xác!') {
                setIsCurrentEmailVerified(true);
                toast.success('Xác thực email hiện tại thành công!');
            }
        } catch (error) {
            toast.error('Mã OTP không chính xác hoặc đã hết hạn!');
        }
    };

    // Xử lý gửi OTP cho email mới
    const handleSendNewEmailOTP = async () => {
        if (!isCurrentEmailVerified) {
            toast.error('Vui lòng xác thực email hiện tại trước!');
            return;
        }
    
        if (!newEmail) {
            toast.error('Vui lòng nhập email mới!');
            return;
        }
    
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(newEmail)) {
            toast.error('Email không hợp lệ!');
            return;
        }
    
        // Kiểm tra lại một lần nữa để đảm bảo
        if (newEmail === currentEmail) {
            toast.error('Email mới không được trùng với email hiện tại!');
            return;
        }
    
        setIsSendingNewOTP(true);
        try {
            await sendChangeEmailOTP(newEmail);
            toast.success('Mã OTP đã được gửi đến email mới của bạn!');
            setIsNewEmailOTPSent(true);
            startCooldown(setNewEmailCooldown);
        } catch (error) {
            toast.error(error.message || 'Không thể gửi mã OTP. Vui lòng thử lại.');
        } finally {
            setIsSendingNewOTP(false);
        }
    };

    // Xử lý xác thực OTP cho email mới
    const handleVerifyNewEmailOTP = async () => {
        try {
            const result = await verifyCode(newEmail, newEmailVerificationCode);
            if (result.message === 'Mã xác nhận chính xác!') {
                setIsNewEmailVerified(true);
                toast.success('Xác thực email mới thành công!');
            }
        } catch (error) {
            toast.error('Mã OTP không chính xác hoặc đã hết hạn!');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!isCurrentEmailVerified) {
            toast.error('Vui lòng xác thực email hiện tại!');
            return;
        }

        if (!isNewEmailVerified) {
            toast.error('Vui lòng xác thực email mới!');
            return;
        }

        if (!captchaToken) {
            toast.error('Vui lòng xác nhận captcha!');
            return;
        }

        setIsLoading(true);
        try {
            await changeEmailService.changeEmail(newEmail, captchaToken);
            toast.success('Đổi email thành công!');
            handleClose();
            setTimeout(() => {
                window.location.reload();
            }, 2000);
        } catch (error) {
            toast.error(error.message);
        } finally {
            setIsLoading(false);
        }
    };

    // Thêm hàm xử lý đóng popup
    const handleClose = () => {
        setIsSendingCurrentOTP(false);
        setIsSendingNewOTP(false);
        // Reset tất cả state về giá trị ban đầu
        setNewEmail('');
        setIsLoading(false);
        setCaptchaToken(null);
        setCurrentEmailVerificationCode('');
        setIsCurrentEmailOTPSent(false);
        setIsCurrentEmailVerified(false);
        setCurrentEmailCooldown(0);
        setNewEmailVerificationCode('');
        setIsNewEmailOTPSent(false);
        setIsNewEmailVerified(false);
        setNewEmailCooldown(0);
        
        // Gọi hàm onClose từ props
        onClose();
    };

    // Thêm hàm xử lý khi email mới thay đổi
    const handleNewEmailChange = (e) => {
        const newEmailValue = e.target.value;
        setNewEmail(newEmailValue);

        // Kiểm tra nếu email mới giống email hiện tại
        if (newEmailValue === currentEmail) {
            toast.error('Email mới không được trùng với email hiện tại!');
            return;
        }
    };

    // Nếu không mở thì return null
    if (!isOpen) return null;

    return (
        <div className="change-email-modal-overlay" onClick={handleClose}>
            <div className="change-email-modal" onClick={e => e.stopPropagation()}>
                <div className="change-email-header">
                    <h2>Đổi Email</h2>
                    <button className="change-email-close-button" onClick={handleClose}>
                        <FaTimes />
                    </button>
                </div>
                <form onSubmit={handleSubmit}>
                    {/* Phần xác thực email hiện tại */}
                    <div className="change-email-form-group">
                        <label>Email Hiện Tại:</label>
                        <div className="change-email-input-wrapper">
                            <input
                                type="email"
                                value={currentEmail}
                                disabled
                                className="change-email-current"
                            />
                            <button
                                type="button"
                                className="change-email-otp-button"
                                onClick={handleSendCurrentEmailOTP}
                                disabled={currentEmailCooldown > 0 || isCurrentEmailVerified || isSendingCurrentOTP}
                            >
                                {isSendingCurrentOTP ? (
                                    <>
                                        <div className="loading-spinner"></div>
                                    </>
                                ) : currentEmailCooldown > 0 ? (
                                    `Gửi lại (${currentEmailCooldown}s)`
                                ) : (
                                    'Gửi OTP'
                                )}
                            </button>
                        </div>
                        
                        {isCurrentEmailOTPSent && !isCurrentEmailVerified && (
                            <div className="change-email-otp-section">
                                <div className="change-email-otp-input-wrapper">
                                    <input
                                        type="text"
                                        className="change-email-otp-input"
                                        placeholder="Nhập mã OTP"
                                        value={currentEmailVerificationCode}
                                        onChange={(e) => setCurrentEmailVerificationCode(e.target.value)}
                                        maxLength={6}
                                    />
                                    <button
                                        type="button"
                                        className="change-email-verify-button"
                                        onClick={handleVerifyCurrentEmailOTP}
                                        disabled={currentEmailVerificationCode.length !== 6}
                                    >
                                        Xác nhận
                                    </button>
                                </div>
                            </div>
                        )}

                        {isCurrentEmailVerified && (
                            <div className="change-email-verified-badge">
                                <FaCheckCircle /> Email hiện tại đã được xác thực
                            </div>
                        )}
                    </div>

                    {/* Phần nhập và xác thực email mới */}
                    <div className="change-email-form-group">
                        <label>Email Mới:</label>
                        <div className="change-email-input-wrapper">
                            <input
                                type="email"
                                value={newEmail}
                                onChange={handleNewEmailChange}
                                placeholder="Nhập email mới"
                                className={newEmail === currentEmail ? 'invalid-email' : ''}
                                required
                            />
                            <button
                                type="button"
                                className="change-email-otp-button"
                                onClick={handleSendNewEmailOTP}
                                disabled={!isCurrentEmailVerified || newEmailCooldown > 0 || isSendingNewOTP}
                            >
                                {isSendingNewOTP ? (
                                    <>
                                        <div className="loading-spinner"></div>
                                    </>
                                ) : newEmailCooldown > 0 ? (
                                    `Gửi lại (${newEmailCooldown}s)`
                                ) : (
                                    'Gửi OTP'
                                )}
                            </button>
                        </div>

                        {isNewEmailOTPSent && !isNewEmailVerified && (
                            <div className="change-email-otp-section">
                                <div className="change-email-otp-input-wrapper">
                                    <input
                                        type="text"
                                        className="change-email-otp-input"
                                        placeholder="Nhập mã OTP"
                                        value={newEmailVerificationCode}
                                        onChange={(e) => setNewEmailVerificationCode(e.target.value)}
                                        maxLength={6}
                                    />
                                    <button
                                        type="button"
                                        className="change-email-verify-button"
                                        onClick={handleVerifyNewEmailOTP}
                                        disabled={newEmailVerificationCode.length !== 6}
                                    >
                                        Xác nhận
                                    </button>
                                </div>
                            </div>
                        )}

                        {isNewEmailVerified && (
                            <div className="change-email-verified-badge">
                                <FaCheckCircle /> Email mới đã được xác thực
                            </div>
                        )}
                    </div>

                    <div className="change-email-captcha">
                        <ReCAPTCHA
                            sitekey="6LeJMI4qAAAAAMl3NjToCLJmx7uwGohGpVt7DDJ7"
                            onChange={handleCaptchaChange}
                        />
                    </div>

                    <div className="change-email-actions">
                        <button 
                            type="button" 
                            className="change-email-cancel-button" 
                            onClick={handleClose}
                        >
                            Hủy
                        </button>
                        <button 
                            type="submit" 
                            className="change-email-submit-button"
                            disabled={isLoading || !isCurrentEmailVerified || !isNewEmailVerified || !captchaToken}
                        >
                            {isLoading ? 'Đang xử lý...' : 'Xác nhận'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default ChangeEmailModal; 