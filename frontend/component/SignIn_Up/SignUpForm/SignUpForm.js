import React, { useState, useEffect } from 'react';
import './SignUpForm.css';
import { Tooltip } from 'react-tooltip';
import Menu from '../../home/menu/Menu';
import { signup } from '../../../services/api/signupService';
import { sendVerificationEmail, verifyCode } from '../../../services/api/emailService';
import { checkAccountNameAvailability, checkEmailAvailability } from '../../../services/api/checkAvailability';
import { ToastContainer, toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import 'react-toastify/dist/ReactToastify.css';
import ClipLoader from 'react-spinners/ClipLoader';
import ReCAPTCHA from 'react-google-recaptcha'; // Import ReCAPTCHA component
import { FaEye, FaEyeSlash } from 'react-icons/fa'; // Import icon mắt

function SignUpForm() {
    const [resendLoading, setResendLoading] = useState(false);
    const [loading, setLoading] = useState(false);
    const [formValues, setFormValues] = useState({
        username: '',
        email: '',
        password: '',
        confirmPassword: '',
    });
    const [errors, setErrors] = useState({});
    const [isVerificationSent, setIsVerificationSent] = useState(false);
    const [verificationCode, setVerificationCode] = useState(Array(6).fill(''));
    const [cooldown, setCooldown] = useState(0);
    const [recaptchaValue, setRecaptchaValue] = useState(null); // State to store reCAPTCHA value
    const [showPassword, setShowPassword] = useState(false); // State để hiển thị mật khẩu
    const [showConfirmPassword, setShowConfirmPassword] = useState(false); // State cho mật khẩu xác nhận
    const navigate = useNavigate();

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const usernameRegex = /^[a-zA-Z0-9]{3,15}$/;
    const passwordRegex = /^.{6,}$/;

    // Kiểm tra token để điều hướng nếu đã đăng nhập
    useEffect(() => {
        const token = document.cookie
            .split('; ')
            .find((row) => row.startsWith('authToken='))
            ?.split('=')[1];

        if (token) {
            navigate('/'); // Hoặc trang chính mà bạn muốn điều hướng tới nếu đã đăng nhập
        }
    }, [navigate]);

    // Hàm chuyển trạng thái hiển thị mật khẩu
    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    // Hàm chuyển trạng thái hiển thị mật khẩu xác nhận
    const toggleConfirmPasswordVisibility = () => {
        setShowConfirmPassword(!showConfirmPassword);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormValues({ ...formValues, [name]: value.trimStart() });
        setErrors({ ...errors, [name]: '' });
    };

    const handleBlur = async (e) => {
        const { name, value } = e.target;
        let error = '';

        if (value) {
            if (name === 'username') {
                if (!usernameRegex.test(value)) {
                    error = 'Tên tài khoản phải từ 3-15 ký tự, chỉ gồm chữ và số.';
                } else {
                    try {
                        const isAccountNameTaken = await checkAccountNameAvailability(value);
                        if (isAccountNameTaken) {
                            error = 'Tên tài khoản đã tồn tại.';
                        }
                    } catch {
                        error = 'Đã xảy ra lỗi khi kiểm tra tên tài khoản.';
                    }
                }
            } else if (name === 'email') {
                if (!emailRegex.test(value)) {
                    error = 'Vui lòng nhập email hợp lệ.';
                } else {
                    try {
                        const isEmailTaken = await checkEmailAvailability(value);
                        if (isEmailTaken) {
                            error = 'Email đã tồn tại.';
                        }
                    } catch {
                        error = 'Đã xảy ra lỗi khi kiểm tra email.';
                    }
                }
            } else if (name === 'password' && !passwordRegex.test(value)) {
                error = 'Mật khẩu phải có ít nhất 6 ký tự.';
            } else if (name === 'confirmPassword' && value !== formValues.password) {
                error = 'Mật khẩu xác nhận không khớp.';
            }
        }

        setErrors((prevErrors) => ({ ...prevErrors, [name]: error }));
    };

    const validateForm = () => {
        const { username, email, password, confirmPassword } = formValues;
        const newErrors = {};

        if (!usernameRegex.test(username)) {
            newErrors.username = 'Tên tài khoản phải từ 3-15 ký tự, chỉ gồm chữ và số.';
        }
        if (!emailRegex.test(email)) {
            newErrors.email = 'Vui lòng nhập email hợp lệ.';
        }
        if (!passwordRegex.test(password)) {
            newErrors.password = 'Mật khẩu phải có ít nhất 6 ký tự.';
        }
        if (password !== confirmPassword) {
            newErrors.confirmPassword = 'Mật khẩu xác nhận không khớp.';
        }

        // Kiểm tra reCAPTCHA
        if (!recaptchaValue) {
            newErrors.recaptcha = 'Vui lòng xác minh reCAPTCHA.';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSendVerification = async () => {
        setLoading(true);
        setResendLoading(true);
        try {
            await sendVerificationEmail(formValues.email);
            toast.success('Mã xác nhận đã được gửi đến email của bạn.', {
                position: 'top-right',
            });
            setIsVerificationSent(true);
            startCooldown();
        } catch (error) {
            toast.error('Không thể gửi mã xác nhận. Vui lòng thử lại.', { position: 'top-right' });
        } finally {
            setResendLoading(false);
            setLoading(false);
        }
    };

    const startCooldown = () => {
        setCooldown(60);
        const interval = setInterval(() => {
            setCooldown((prev) => {
                if (prev <= 1) {
                    clearInterval(interval);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
    };

    const handleCodeChange = (e, index) => {
        const value = e.target.value.toUpperCase();

        if (e.clipboardData) {
            const pastedData = e.clipboardData.getData('Text').toUpperCase();
            if (pastedData.length === 6 && /^[A-Z0-9]+$/.test(pastedData)) {
                const newCode = pastedData.split('');
                setVerificationCode(newCode);
                document.getElementById(`code-5`).focus();
                return;
            }
        }

        if (e.key === 'Backspace' && !value && index > 0) {
            const newCode = [...verificationCode];
            newCode[index - 1] = '';
            setVerificationCode(newCode);
            document.getElementById(`code-${index - 1}`).focus();
            return;
        }

        if (/^[A-Z0-9]$/.test(value) || value === '') {
            const newCode = [...verificationCode];
            newCode[index] = value;
            setVerificationCode(newCode);

            if (value && index < 5) {
                document.getElementById(`code-${index + 1}`).focus();
            }
        }
    };

    const handleVerifyCode = async () => {
        try {
            const code = verificationCode.join('');
            await verifyCode(formValues.email, code);
            await handleSignup();
        } catch (error) {
            toast.error('Mã xác nhận không hợp lệ. Vui lòng thử lại.', { position: 'top-right' });
        }
    };

    const handleSignup = async () => {
        setLoading(true);
        const { username, email, password } = formValues;
        try {
            await signup(username, email, password);
            toast.success('Đăng ký thành công! Bạn sẽ được chuyển hướng đến trang đăng nhập.', {
                position: 'top-right',
            });
            setTimeout(() => {
                navigate('/user/signin');
            }, 2000);
        } catch (error) {
            toast.error('Đăng ký thất bại. Vui lòng thử lại.', { position: 'top-right' });
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Kiểm tra xem người dùng đã hoàn thành reCAPTCHA chưa
        if (!recaptchaValue) {
            toast.error('Vui lòng xác minh reCAPTCHA trước khi tạo tài khoản.', {
                position: 'top-right',
            });
            return; // Dừng quá trình gửi form nếu chưa xác minh reCAPTCHA
        }

        // Kiểm tra các trường khác
        if (!validateForm()) return;

        const isAccountNameTaken = await checkAccountNameAvailability(formValues.username);
        const isEmailTaken = await checkEmailAvailability(formValues.email);

        if (isAccountNameTaken) {
            toast.error('Tên tài khoản đã tồn tại.', { position: 'top-right' });
            return;
        }
        if (isEmailTaken) {
            toast.error('Email đã tồn tại.', { position: 'top-right' });
            return;
        }

        await handleSendVerification();
    };

    return (
        <>
            <Menu isStatic />
            <div className="signup-background">
                <div className="signup-container">
                    <div className="signup-box">
                        <h2 className="signup-title">{isVerificationSent ? 'Nhập Mã Xác Nhận' : 'Tạo Tài Khoản'}</h2>
                        {!isVerificationSent ? (
                            <form onSubmit={handleSubmit}>
                                <div className="signup-input-group">
                                    <input
                                        type="text"
                                        name="username"
                                        placeholder="Tên Tài Khoản"
                                        value={formValues.username}
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                        className={`signup-input ${errors.username ? 'signup-error-input' : ''}`}
                                    />
                                    {errors.username && (
                                        <p className="signup-error-text show">
                                            <span className="signup-error-icon"></span> {errors.username}
                                        </p>
                                    )}
                                </div>
                                <div className="signup-input-group">
                                    <input
                                        type="email"
                                        name="email"
                                        placeholder="Gmail"
                                        value={formValues.email}
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                        className={`signup-input ${errors.email ? 'signup-error-input' : ''}`}
                                    />
                                    {errors.email && (
                                        <p className="signup-error-text show">
                                            <span className="signup-error-icon"></span> {errors.email}
                                        </p>
                                    )}
                                </div>
                                <div className="signup-input-group">
                                    <div className="group-input-password">
                                        <input
                                            id="input-password"
                                            type={showPassword ? 'text' : 'password'}
                                            name="password"
                                            placeholder="Mật Khẩu"
                                            value={formValues.password}
                                            onChange={handleChange}
                                            onBlur={handleBlur}
                                            className={`signup-input ${errors.password ? 'signup-error-input' : ''}`}
                                        />
                                        <span className="password-icon" onClick={togglePasswordVisibility}>
                                            {showPassword ? <FaEyeSlash /> : <FaEye />}
                                        </span>
                                    </div>
                                    {errors.password && (
                                        <p className="signup-error-text show">
                                            <span className="signup-error-icon"></span> {errors.password}
                                        </p>
                                    )}
                                </div>
                                <div className="signup-input-group">
                                    <div className="group-input-password">
                                        <input
                                            id="input-confirmPassword"
                                            type={showConfirmPassword ? 'text' : 'password'}
                                            name="confirmPassword"
                                            placeholder="Xác Nhận Mật Khẩu"
                                            value={formValues.confirmPassword}
                                            onChange={handleChange}
                                            onBlur={handleBlur}
                                            className={`signup-input ${
                                                errors.confirmPassword ? 'signup-error-input' : ''
                                            }`}
                                        />
                                        <span className="password-icon" onClick={toggleConfirmPasswordVisibility}>
                                            {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                                        </span>
                                    </div>
                                    {errors.confirmPassword && (
                                        <p className="signup-error-text show">
                                            <span className="signup-error-icon"></span> {errors.confirmPassword}
                                        </p>
                                    )}
                                </div>

                                {/* reCAPTCHA */}
                                <div className="signup-input-group signup-recaptcha-container">
                                    <ReCAPTCHA
                                        sitekey="6LeJMI4qAAAAAMl3NjToCLJmx7uwGohGpVt7DDJ7"
                                        onChange={(value) => setRecaptchaValue(value)} // Set reCAPTCHA value
                                    />
                                    {errors.recaptcha && (
                                        <p className="signup-error-text show">
                                            <span className="signup-error-icon"></span> {errors.recaptcha}
                                        </p>
                                    )}
                                </div>

                                <button
                                    type="submit"
                                    className="signup-button"
                                    disabled={loading || !recaptchaValue} // Vô hiệu hóa nút nếu reCAPTCHA chưa được hoàn thành
                                >
                                    {loading ? <ClipLoader size={20} color={'#ffffff'} /> : 'Tạo Tài Khoản'}
                                </button>
                            </form>
                        ) : (
                            <div className="verification-container">
                                <div className="code-inputs">
                                    {verificationCode.map((code, index) => (
                                        <input
                                            key={index}
                                            id={`code-${index}`}
                                            type="text"
                                            maxLength="1"
                                            value={code}
                                            onChange={(e) => handleCodeChange(e, index)}
                                            onKeyDown={(e) => handleCodeChange(e, index)}
                                            onPaste={(e) => handleCodeChange(e, index)}
                                            className="code-input"
                                            autoComplete="off"
                                        />
                                    ))}
                                </div>
                                <button onClick={handleVerifyCode} className="verification-button">
                                    Xác Nhận
                                </button>
                                <p
                                    onClick={cooldown === 0 ? handleSendVerification : null}
                                    style={{
                                        cursor: cooldown > 0 ? 'not-allowed' : 'pointer',
                                        color: cooldown > 0 ? 'gray' : 'black',
                                    }}
                                >
                                    {resendLoading ? (
                                        <ClipLoader size={15} color="blue" />
                                    ) : cooldown > 0 ? (
                                        `Gửi lại mã sau ${cooldown}s`
                                    ) : (
                                        'Gửi lại mã xác nhận'
                                    )}
                                </p>
                            </div>
                        )}
                        {!isVerificationSent && (
                            <p className="signup-toggle-text">
                                Bạn Đã Có Tài Khoản? <a href="/user/signin">Đăng Nhập</a>
                            </p>
                        )}
                    </div>
                </div>
                <Tooltip id="tooltip" place="right" type="error" effect="solid" className="signup-custom-tooltip" />
            </div>
            <ToastContainer style={{ marginTop: '70px' }} />
        </>
    );
}

export default SignUpForm;
