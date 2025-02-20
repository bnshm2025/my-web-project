import React, { useState, useEffect } from 'react';
import './SignInForm.css';
import { useNavigate } from 'react-router-dom';
import Menu from '../../home/menu/Menu';
import signinService from '../../../services/api/signinService';
import forgotPasswordService from '../../../services/api/forgotPasswordService';
import ClipLoader from 'react-spinners/ClipLoader';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FaEye, FaEyeSlash, FaTimes, FaCheckCircle } from 'react-icons/fa';
import { FaLock } from 'react-icons/fa';
import ReCAPTCHA from 'react-google-recaptcha';
import { sendChangeEmailOTP, verifyCode } from '../../../services/api/emailService';

function SignInForm() {
    const navigate = useNavigate();
    const [identifier, setIdentifier] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);
    const [rememberMe, setRememberMe] = useState(false);
    const [isForgotPassword, setIsForgotPassword] = useState(false);
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [user, setUser] = useState(null);
    const [showPassword, setShowPassword] = useState(false);
    const [isResetPasswordModalOpen, setIsResetPasswordModalOpen] = useState(false);
    const [resetEmail, setResetEmail] = useState('');
    const [resetOTP, setResetOTP] = useState('');
    const [isOTPSent, setIsOTPSent] = useState(false);
    const [isOTPVerified, setIsOTPVerified] = useState(false);
    const [newPassword, setNewPassword] = useState('');
    const [confirmNewPassword, setConfirmNewPassword] = useState('');
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmNewPassword, setShowConfirmNewPassword] = useState(false);
    const [captchaToken, setCaptchaToken] = useState(null);
    const [cooldown, setCooldown] = useState(0);
    const [isSendingOTP, setIsSendingOTP] = useState(false);

    // Kiểm tra token đã điều hướng nếu đã đăng nhập
    useEffect(() => {
        const token = document.cookie
            .split('; ')
            .find((row) => row.startsWith('authToken='))
            ?.split('=')[1];

        if (token) {
            navigate('/'); // Điều hướng đến trang chính nếu đã đăng nhập
        }
    }, [navigate]);

    useEffect(() => {
        if (user) {
            navigate('/');
        }

        const savedCredentials = JSON.parse(localStorage.getItem('savedCredentials'));
        if (savedCredentials) {
            const now = new Date().getTime();
            if (now < savedCredentials.expiration) {
                setIdentifier(savedCredentials.identifier);
                setPassword(savedCredentials.password);
                setRememberMe(true);
            } else {
                localStorage.removeItem('savedCredentials');
            }
        }
    }, [user, navigate]);

    const handleTogglePasswordVisibility = () => {
        setShowPassword((prevState) => !prevState); // Toggle giữa hiển thị/ẩn mật khẩu
    };

    const handleSignInSubmit = async (event) => {
        event.preventDefault();
        setError(null);
        setIsSubmitting(true);

        try {
            const userName = await signinService.signin(identifier, password);
            setUser({ username: userName });

            // Hiển thị thông báo đăng nhập thành công
            toast.success(`Đăng nhập thành công!`, {
                position: 'top-right',
                autoClose: 3000, // Đóng sau 3 giây
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
            });

            if (rememberMe) {
                const expirationTime = new Date().getTime() + 600 * 1000;
                localStorage.setItem(
                    'savedCredentials',
                    JSON.stringify({ identifier, password, expiration: expirationTime }),
                );
            } else {
                localStorage.removeItem('savedCredentials');
            }

            // Điều hướng về trang chính
            navigate('/');
        } catch (error) {
            const errorMessage =
                error.response && typeof error.response.data === 'object'
                    ? error.response.data.message
                    : error.response?.data || 'Đã xảy ra lỗi. Vui lòng thử lại sau.';
            setError(errorMessage);
            toast.error(errorMessage, {
                position: 'top-right',
                autoClose: 3000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleForgotPasswordSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setMessage('');
        setIsSubmitting(true);

        try {
            const response = await forgotPasswordService.sendForgotPassword(email);
            toast.success('Email khôi phục mật khẩu đã được gửi thành công!', {
                position: 'top-right',
                autoClose: 3000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
            });
            setMessage(response.message);
        } catch (error) {
            const errorMessage = error.message || 'Đã xảy ra lỗi. Vui lòng thử lại sau.';
            setError(errorMessage);
            toast.error(errorMessage, {
                position: 'top-right',
                autoClose: 3000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleCreateAccountClick = () => {
        navigate('/user/signup');
    };

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
        setIsSendingOTP(true); // Bắt đầu loading
        if (!resetEmail) {
            toast.error('Vui lòng nhập email!');
            return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(resetEmail)) {
            toast.error('Email không hợp lệ!');
            return;
        }

        try {
            await sendChangeEmailOTP(resetEmail);
            toast.success('Mã OTP đã được gửi đến email của bạn!');
            setIsOTPSent(true);
            startCooldown();
        } catch (error) {
            toast.error(error.message || 'Không thể gửi mã OTP');
        } finally {
            setIsSendingOTP(false); // Kết thúc loading
        }
    };

    // Xử lý xác thực OTP
    const handleVerifyOTP = async () => {
        try {
            const result = await verifyCode(resetEmail, resetOTP);
            if (result.success) {
                setIsOTPVerified(true);
                toast.success('Xác thực OTP thành công!');
            } else {
                toast.error('Mã OTP không chính xác!');
            }
        } catch (error) {
            toast.error('Mã OTP không chính xác hoặc đã hết hạn!');
        }
    };

    // Xử lý đặt lại mật khẩu
    const handleResetPassword = async (e) => {
        e.preventDefault();

        if (!isOTPVerified) {
            toast.error('Vui lòng xác thực OTP trước!');
            return;
        }

        if (!captchaToken) {
            toast.error('Vui lòng xác nhận captcha!');
            return;
        }

        if (newPassword !== confirmNewPassword) {
            toast.error('Mật khẩu mới và xác nhận mật khẩu không khớp!');
            return;
        }

        if (newPassword.length < 6) {
            toast.error('Mật khẩu mới phải có ít nhất 6 ký tự!');
            return;
        }

        setIsSubmitting(true);
        try {
            await forgotPasswordService.resetPassword(resetEmail, newPassword, captchaToken);
            toast.success('Đặt lại mật khẩu thành công!');
            handleCloseResetModal();
            navigate('/user/signin');
        } catch (error) {
            toast.error(error.message || 'Đã xảy ra lỗi khi đặt lại mật khẩu');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleCloseResetModal = () => {
        setIsResetPasswordModalOpen(false);
        setResetEmail('');
        setResetOTP('');
        setIsOTPSent(false);
        setIsOTPVerified(false);
        setNewPassword('');
        setConfirmNewPassword('');
        setShowNewPassword(false);
        setShowConfirmNewPassword(false);
        setCaptchaToken(null);
        setCooldown(0);
    };

    return (
        <>
            <Menu isStatic />
            <div className="signin-background">
                <div className="signin-container">
                    <div className="signin-form-column">
                        <div className="signin-box">
                            <h2 className="signin-title">Đăng Nhập</h2>
                            <form onSubmit={handleSignInSubmit}>
                                <div className="signin-input-group">
                                    <input
                                        type="text"
                                        placeholder="Tên tài khoản hoặc Email"
                                        value={identifier}
                                        onChange={(e) => setIdentifier(e.target.value)}
                                        required
                                        autoComplete="username"
                                    />
                                </div>
                                <div className="signin-input-group">
                                    <div className="group-input-password">
                                        <input
                                            id="input-password"
                                            type={showPassword ? 'text' : 'password'}
                                            placeholder="Mật khẩu"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            required
                                            autoComplete="current-password"
                                        />
                                        <span className="password-icon" onClick={handleTogglePasswordVisibility}>
                                            {showPassword ? <FaEyeSlash /> : <FaEye />}
                                        </span>
                                    </div>
                                </div>
                                <div className="signin-remember-me">
                                    <input
                                        type="checkbox"
                                        checked={rememberMe}
                                        onChange={(e) => setRememberMe(e.target.checked)}
                                    />
                                    <label>Lưu thông tin đăng nhập</label>
                                </div>
                                <button
                                    type="button"
                                    className="signin-forgot-password"
                                    onClick={() => setIsResetPasswordModalOpen(true)}
                                >
                                    Quên Mật Khẩu?
                                </button>
                                <div className="forgot-password-captcha">
                                    <ReCAPTCHA
                                        sitekey="6LeJMI4qAAAAAMl3NjToCLJmx7uwGohGpVt7DDJ7"
                                        onChange={(token) => setCaptchaToken(token)}
                                    />
                                </div>
                                <button
                                    type="submit"
                                    className="signin-button"
                                    disabled={isSubmitting || !captchaToken} // Chỉ bật khi captchaToken tồn tại
                                >
                                    {isSubmitting ? 'Đang xử lý...' : 'Đăng Nhập'}
                                </button>

                                {error && <p className="signin-error">{error}</p>}
                            </form>
                        </div>
                    </div>
                    <div className="signin-form-column signin-create-account-box">
                        <h2 className="signin-subtitle">Bạn Chưa Có Tài Khoản?</h2>
                        <p className="signin-description">
                            Tạo Một Tài Khoản Để Bắt Đầu Và Tận Hưởng Trò Chơi Theo Cách Của Bạn!
                        </p>
                        <button onClick={handleCreateAccountClick} className="signin-create-account-button">
                            Tạo Tài Khoản
                        </button>
                    </div>
                </div>
            </div>

            {/* Modal Quên Mật Khẩu */}
            {isResetPasswordModalOpen && (
                <div className="signin-forgot-password-modal-overlay">
                    <div className="signin-forgot-password-modal">
                        <div className="forgot-password-header">
                            <h2 className="forgot-password-title">Quên Mật Khẩu</h2>
                            <button className="change-password-close-button" onClick={handleCloseResetModal}>
                                <FaTimes />
                            </button>
                        </div>
                        <form onSubmit={handleResetPassword} className="forgot-password-form">
                            <div className="forgot-password-input-group">
                                <input
                                    type="email"
                                    className="forgot-password-input"
                                    placeholder="Nhập email của bạn"
                                    value={resetEmail}
                                    onChange={(e) => setResetEmail(e.target.value)}
                                    disabled={isOTPSent}
                                    required
                                />
                            </div>

                            <div className="forgot-password-otp-section">
                                <button
                                    type="button"
                                    className="forgot-password-otp-button"
                                    onClick={handleSendOTP}
                                    disabled={cooldown > 0 || isOTPVerified || !resetEmail}
                                >
                                    {isSendingOTP ? (
                                        <span className="loading-spinner"></span>
                                    ) : cooldown > 0 ? (
                                        `Gửi lại (${cooldown}s)`
                                    ) : (
                                        'Gửi OTP'
                                    )}
                                </button>

                                {isOTPSent && !isOTPVerified && (
                                    <div className="forgot-password-input-group">
                                        <input
                                            type="text"
                                            className="forgot-password-input"
                                            placeholder="Nhập mã OTP"
                                            value={resetOTP}
                                            onChange={(e) => setResetOTP(e.target.value)}
                                            maxLength={6}
                                        />
                                        <button
                                            type="button"
                                            className="forgot-password-otp-button"
                                            onClick={handleVerifyOTP}
                                            disabled={resetOTP.length !== 6}
                                        >
                                            Xác nhận OTP
                                        </button>
                                    </div>
                                )}

                                {isOTPVerified && (
                                    <div className="forgot-password-verified-badge">
                                        <FaCheckCircle /> Xác thực thành công
                                    </div>
                                )}
                            </div>

                            {isOTPVerified && (
                                <>
                                    <div className="forgot-password-input-group">
                                        <input
                                            type={showNewPassword ? 'text' : 'password'}
                                            className="forgot-password-input"
                                            placeholder="Mật khẩu mới"
                                            value={newPassword}
                                            onChange={(e) => setNewPassword(e.target.value)}
                                            required
                                        />
                                        <button
                                            type="button"
                                            className="forgot-password-password-toggle"
                                            onClick={() => setShowNewPassword(!showNewPassword)}
                                        >
                                            {showNewPassword ? <FaEyeSlash /> : <FaEye />}
                                        </button>
                                    </div>

                                    <div className="forgot-password-input-group">
                                        <input
                                            type={showConfirmNewPassword ? 'text' : 'password'}
                                            className="forgot-password-input"
                                            placeholder="Xác nhận mật khẩu mới"
                                            value={confirmNewPassword}
                                            onChange={(e) => setConfirmNewPassword(e.target.value)}
                                            required
                                        />
                                        <button
                                            type="button"
                                            className="forgot-password-password-toggle"
                                            onClick={() => setShowConfirmNewPassword(!showConfirmNewPassword)}
                                        >
                                            {showConfirmNewPassword ? <FaEyeSlash /> : <FaEye />}
                                        </button>
                                    </div>

                                    <div className="forgot-password-captcha">
                                        <ReCAPTCHA
                                            sitekey="6LeJMI4qAAAAAMl3NjToCLJmx7uwGohGpVt7DDJ7"
                                            onChange={(token) => setCaptchaToken(token)}
                                        />
                                    </div>
                                </>
                            )}

                            <div className="forgot-password-actions">
                                <button
                                    type="button"
                                    className="forgot-password-cancel-button"
                                    onClick={handleCloseResetModal}
                                >
                                    Hủy
                                </button>
                                {isOTPVerified && (
                                    <button
                                        type="submit"
                                        className="forgot-password-submit-button"
                                        disabled={isSubmitting || !captchaToken}
                                    >
                                        {isSubmitting ? 'Đang xử lý...' : 'Xác nhận'}
                                    </button>
                                )}
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}

export default SignInForm;
