import React, { useState, useEffect } from 'react';
import { FaEye, FaEyeSlash, FaTimes, FaCheckCircle } from 'react-icons/fa';
import { toast } from 'react-toastify';
import ReCAPTCHA from "react-google-recaptcha";
import { sendChangeEmailOTP, verifyCode } from '../../services/api/emailService';
import changePasswordService from '../../services/api/changePasswordService';
import './ChangePasswordPopup.css';

function ChangePasswordModal({ isOpen, onClose, userEmail }) {
    const [formData, setFormData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    
    // State cho OTP
    const [verificationCode, setVerificationCode] = useState('');
    const [isOTPSent, setIsOTPSent] = useState(false);
    const [isVerified, setIsVerified] = useState(false);
    const [cooldown, setCooldown] = useState(0);
    const [captchaToken, setCaptchaToken] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [showPasswords, setShowPasswords] = useState({
        current: false,
        new: false,
        confirm: false
    });
    const [isSendingOTP, setIsSendingOTP] = useState(false);
    const [isCurrentPasswordValid, setIsCurrentPasswordValid] = useState(true);

    // Xử lý đếm ngược cooldown
    const startCooldown = () => {
        setCooldown(60);
        const timer = setInterval(() => {
            setCooldown((prev) => {
                if (prev <= 1) {
                    clearInterval(timer);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
    };

    // Xử lý gửi OTP
    const handleSendOTP = async () => {
        setIsSendingOTP(true);
        try {
            await sendChangeEmailOTP(userEmail);
            toast.success('Mã OTP đã được gửi đến email của bạn!');
            setIsOTPSent(true);
            startCooldown();
        } catch (error) {
            toast.error(error.message || 'Không thể gửi mã OTP');
        } finally {
            setIsSendingOTP(false);
        }
    };

    // Xử lý xác thực OTP
    const handleVerifyOTP = async () => {
        try {
            const result = await verifyCode(userEmail, verificationCode);
            console.log('Verify result:', result);
            if (result.success) {
                setIsVerified(true);
                toast.success('Xác thực OTP thành công!');
            } else {
                toast.error('Mã OTP không chính xác!');
            }
        } catch (error) {
            console.error('Verify error:', error);
            toast.error('Mã OTP không chính xác hoặc đã hết hạn!');
        }
    };

    // Sửa lại hàm xử lý captcha
    const handleCaptchaChange = (token) => {
        console.log('Captcha token:', token);
        setCaptchaToken(token);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!isVerified) {
            toast.error('Vui lòng xác thực OTP trước!');
            return;
        }

        if (!captchaToken) {
            toast.error('Vui lòng xác nhận captcha!');
            return;
        }

        if (formData.newPassword !== formData.confirmPassword) {
            toast.error('Mật khẩu mới và xác nhận mật khẩu không khớp!');
            return;
        }

        if (formData.newPassword.length < 6) {
            toast.error('Mật khẩu mới phải có ít nhất 6 ký tự!');
            return;
        }

        setIsLoading(true);
        try {
            await changePasswordService.changePassword(
                formData.currentPassword,
                formData.newPassword,
                captchaToken
            );
            
            toast.success('Đổi mật khẩu thành công!');
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

    const handleClose = () => {
        setFormData({
            currentPassword: '',
            newPassword: '',
            confirmPassword: ''
        });
        setVerificationCode('');
        setIsOTPSent(false);
        setIsVerified(false);
        setCooldown(0);
        setCaptchaToken(null);
        setIsLoading(false);
        onClose();
    };

    // Thêm useEffect để debug
    useEffect(() => {
        console.log('Debug states:', {
            isLoading,
            isVerified,
            captchaToken,
            isButtonDisabled: isLoading || !isVerified || !captchaToken
        });
    }, [isLoading, isVerified, captchaToken]);

    // Thêm hàm kiểm tra mật khẩu hiện tại
    const checkCurrentPassword = async () => {
        try {
            const isValid = await changePasswordService.verifyCurrentPassword(formData.currentPassword);
            setIsCurrentPasswordValid(isValid);
            if (!isValid) {
                toast.error('Mật khẩu hiện tại không đúng!');
            }
        } catch (error) {
            toast.error('Đã xảy ra lỗi khi kiểm tra mật khẩu.');
        }
    };

    if (!isOpen) return null;

    return (
        <div className="change-password-modal-overlay" onClick={handleClose}>
            <div className="change-password-modal" onClick={e => e.stopPropagation()}>
                <div className="change-password-header">
                    <h2>Đổi Mật Khẩu</h2>
                    <button className="change-password-close-button" onClick={handleClose}>
                        <FaTimes />
                    </button>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="change-password-form-group">
                        <label>Mật khẩu hiện tại</label>
                        <div className="change-password-input-container">
                            <input
                                type={showPasswords.current ? "text" : "password"}
                                value={formData.currentPassword}
                                onChange={(e) => setFormData({...formData, currentPassword: e.target.value})}
                                onBlur={checkCurrentPassword}
                                required
                            />
                            <button
                                type="button"
                                className="change-password-toggle"
                                onClick={() => setShowPasswords({...showPasswords, current: !showPasswords.current})}
                            >
                                {showPasswords.current ? <FaEyeSlash /> : <FaEye />}
                            </button>
                        </div>
                    </div>

                    <div className="change-password-otp-section">
                        <button
                            type="button"
                            className="change-password-otp-button"
                            onClick={handleSendOTP}
                            disabled={isSendingOTP || cooldown > 0 || isVerified || !isCurrentPasswordValid || !formData.currentPassword}
                        >
                            {isSendingOTP ? (
                                <span className="loading-spinner"></span>
                            ) : cooldown > 0 ? (
                                `Gửi lại (${cooldown}s)`
                            ) : (
                                'Gửi OTP'
                            )}
                        </button>

                        {isOTPSent && !isVerified && (
                            <div className="change-password-otp-input-wrapper">
                                <input
                                    type="text"
                                    className="change-password-otp-input"
                                    placeholder="Nhập mã OTP"
                                    value={verificationCode}
                                    onChange={(e) => setVerificationCode(e.target.value)}
                                    maxLength={6}
                                />
                                <button
                                    type="button"
                                    className="change-password-verify-button"
                                    onClick={handleVerifyOTP}
                                    disabled={verificationCode.length !== 6}
                                >
                                    Xác nhận
                                </button>
                            </div>
                        )}

                        {isVerified && (
                            <div className="change-password-verified-badge">
                                <FaCheckCircle /> Xác thực thành công
                            </div>
                        )}
                    </div>

                    <div className="change-password-form-group">
                        <label>Mật khẩu mới</label>
                        <div className="change-password-input-container">
                            <input
                                type={showPasswords.new ? "text" : "password"}
                                value={formData.newPassword}
                                onChange={(e) => setFormData({...formData, newPassword: e.target.value})}
                                required
                            />
                            <button
                                type="button"
                                className="change-password-toggle"
                                onClick={() => setShowPasswords({...showPasswords, new: !showPasswords.new})}
                            >
                                {showPasswords.new ? <FaEyeSlash /> : <FaEye />}
                            </button>
                        </div>
                    </div>

                    <div className="change-password-form-group">
                        <label>Xác nhận mật khẩu mới</label>
                        <div className="change-password-input-container">
                            <input
                                type={showPasswords.confirm ? "text" : "password"}
                                value={formData.confirmPassword}
                                onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                                required
                            />
                            <button
                                type="button"
                                className="change-password-toggle"
                                onClick={() => setShowPasswords({...showPasswords, confirm: !showPasswords.confirm})}
                            >
                                {showPasswords.confirm ? <FaEyeSlash /> : <FaEye />}
                            </button>
                        </div>
                    </div>

                    <div className="change-password-captcha">
                        <ReCAPTCHA
                            sitekey="6LeJMI4qAAAAAMl3NjToCLJmx7uwGohGpVt7DDJ7"
                            onChange={handleCaptchaChange}
                        />
                    </div>

                    <div className="change-password-actions">
                        <button type="button" className="change-password-cancel-button" onClick={handleClose}>
                            Hủy
                        </button>
                        <button 
                            type="submit" 
                            className="change-password-submit-button"
                            disabled={isLoading || !isVerified || !captchaToken}
                            onClick={() => console.log('Button clicked')}
                        >
                            {isLoading ? 'Đang xử lý...' : 'Xác nhận'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default ChangePasswordModal;