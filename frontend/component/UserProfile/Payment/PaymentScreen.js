import React, { useState, useEffect } from 'react';
import {
    generateVietQR,
    checkTransaction,
    createPaymentOrder,
    updatePaymentOrderStatus,
    paymentSuccess,
} from '../../../services/api/transactionsService';
import { FaArrowLeft, FaCopy, FaClipboardCheck } from 'react-icons/fa';
import { ClipLoader } from 'react-spinners';
import { FerrisWheelSpinner } from 'react-spinner-overlay';
import ReCAPTCHA from 'react-google-recaptcha';

const predefinedAmounts = [10000, 20000, 50000, 100000, 200000, 500000, 1000000];

const PaymentScreen = () => {
    const [amount, setAmount] = useState('');
    const [qrData, setQrData] = useState(null);
    const [error, setError] = useState('');
    const [isAmountConfirmed, setIsAmountConfirmed] = useState(false);
    const [copiedItem, setCopiedItem] = useState(null);
    const [isQrLoading, setIsQrLoading] = useState(false);
    const [intervalId, setIntervalId] = useState(null);
    const [transactionFound, setTransactionFound] = useState(false);
    const [transactionSuccess, setTransactionSuccess] = useState(false);
    const [orderId, setOrderId] = useState(null);
    const [userId, setUserId] = useState(null);
    const [userName, setUserName] = useState('');
    const [timeLeft, setTimeLeft] = useState(600); // Đặt thời gian đếm ngược ban đầu là 10 phút (600 giây)
    const [captchaToken, setCaptchaToken] = useState(null);

    useEffect(() => {
        if (!isAmountConfirmed || transactionFound) return; // Dừng đếm ngược nếu không có số tiền xác nhận hoặc đã tìm thấy giao dịch

        if (timeLeft <= 0) {
            alert('Thời gian thanh toán đã hết. Trang sẽ tải lại.');
            window.location.reload(); // Load lại trang khi hết thời gian
            return;
        }

        const interval = setInterval(() => {
            setTimeLeft((prevTime) => prevTime - 1); // Giảm thời gian đếm ngược mỗi giây
        }, 1000); // Cập nhật mỗi giây

        return () => clearInterval(interval); // Dọn dẹp interval khi component unmount
    }, [timeLeft, isAmountConfirmed, transactionFound]);

    // Hiển thị thời gian đếm ngược trong giao diện người dùng (tùy chọn)
    const formatTime = (time) => {
        const minutes = Math.floor(time / 60);
        const seconds = time % 60;
        return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
    };

    // Hàm định dạng số tiền với dấu phẩy
    const formatAmount = (value) => {
        return Number(value).toLocaleString('vi-VN');
    };

    // Hàm xác nhận số tiền
    const handleConfirmAmount = async () => {
        const numericAmount = parseInt(amount.replace(/\./g, ''), 10);

        if (!numericAmount || numericAmount < 10000) {
            setError('Vui lòng nhập số tiền tối thiểu là 10,000.');
            return;
        }

        if (numericAmount % 1000 !== 0) {
            setError('Số tiền phải là bội số của 1,000.');
            return;
        }

        if (!captchaToken) {
            setError('Vui lòng xác nhận captcha.');
            return;
        }

        setError('');
        setIsAmountConfirmed(true);
        await handleGenerateQR(numericAmount); // Tạo mã QR và tiếp tục
    };

    // Hàm tạo mã QR
    const handleGenerateQR = async (numericAmount) => {
        setIsQrLoading(true); // Bật loading cho mã QR
        try {
            const data = await generateVietQR(numericAmount); // Gọi API để tạo mã QR
            setQrData(data);

            setUserId(data.userId);
            setUserName(data.userName);
            setAmount(data.amount);

            startTransactionChecking(data.amount, data.addInfo); // Bắt đầu kiểm tra giao dịch liên tục

            const order = await createPaymentOrder(data.userId, data.userName, data.addInfo, data.amount); // Tạo đơn hàng
            setOrderId(order.orderId); // Lưu orderId vào state

            setTimeLeft(600); // Đặt lại thời gian đếm ngược sau khi tạo mã QR
        } catch (err) {
            setError('Không thể tạo mã QR hoặc đơn hàng. Vui lòng thử lại.');
            console.error('Lỗi khi tạo mã QR hoặc đơn hàng:', err);
        } finally {
            setIsQrLoading(false); // Dừng loading cho mã QR
        }
    };

    useEffect(() => {
        const handleBeforeUnload = async (event) => {
            if (orderId && !transactionSuccess && !transactionFound) {
                try {
                    console.log(`Đang cập nhật trạng thái đơn hàng ${orderId} thành 'Failed'...`);
                    const response = await updatePaymentOrderStatus(orderId, 'Failed');
                    console.log('Cập nhật thành công:', response);
                } catch (err) {
                    console.error(`Lỗi khi cập nhật trạng thái đơn hàng ${orderId}:`, err);
                }
            }
        };

        if (!transactionSuccess) {
            window.addEventListener('beforeunload', handleBeforeUnload);
            return () => {
                window.removeEventListener('beforeunload', handleBeforeUnload);
            };
        }
    }, [orderId, transactionSuccess]); // Chạy khi orderId hoặc transactionSuccess thay đổi

    // Hàm kiểm tra giao dịch
    const handleCheckTransaction = async (amount, addInfo) => {
        if (transactionFound) return; // Nếu đã tìm thấy giao dịch, dừng kiểm tra

        try {
            const result = await checkTransaction(amount, addInfo); // Gọi checkTransaction API
            if (result.success) {
                setQrData(result.transaction);
                setTransactionFound(true);
                setTransactionSuccess(true);
                clearInterval(intervalId);
            } else {
            }
        } catch (error) {
            console.log('Lỗi khi kiểm tra giao dịch:', error);
            setError('');
        }
    };

    // Hàm bắt đầu fetch liên tục sau khi tạo mã QR
    const startTransactionChecking = (amount, addInfo) => {
        if (transactionFound) return;

        const interval = setInterval(() => {
            if (!transactionFound) {
                // Tiếp tục kiểm tra nếu chưa tìm thấy giao dịch
                handleCheckTransaction(amount, addInfo);
            } else {
                clearInterval(interval); // Dừng khi đã tìm thấy giao dịch
            }
        }, 5000); // Kiểm tra mỗi 5 giây
        setIntervalId(interval); // Lưu intervalId vào state
    };

    // Hàm xử lý sự thay đổi của input số tiền
    const handleAmountChange = (e) => {
        const inputValue = e.target.value.replace(/\./g, '');
        setAmount(formatAmount(inputValue));
    };

    // Hàm xử lý khi người dùng chọn số tiền đã định sẵn
    const handleAmountClick = (value) => {
        setAmount(formatAmount(value));
    };

    // Hàm dùng khi giao dịch thành công
const handleGoBackSuccess = () => {
    // Reset giao diện mà không cần gọi API
    setIsAmountConfirmed(false);
    setTransactionFound(false);
    setTransactionSuccess(false);
    setQrData(null);
    setError('');
    setTimeLeft(600); // Reset thời gian đếm ngược
    setAmount('');
};

// Hàm dùng khi giao dịch chưa thành công
const handleGoBackGeneral = async () => {
    try {
        // Nếu giao dịch chưa thành công và có orderId, cập nhật trạng thái đơn hàng thành "Failed"
        if (orderId && !transactionSuccess) {
            await updatePaymentOrderStatus(orderId, 'Failed');
        }
    } catch (err) {
        console.error(`Lỗi khi cập nhật trạng thái đơn hàng ${orderId}:`, err);
    }

    // Xóa interval nếu đang chạy
    if (intervalId) {
        clearInterval(intervalId);
    }

    // Reset giao diện và trạng thái
    setIsAmountConfirmed(false);
    setTransactionFound(false);
    setTransactionSuccess(false);
    setQrData(null);
    setError('');
    setTimeLeft(600); // Reset thời gian đếm ngược
    setAmount('');
};


    // Hàm sao chép văn bản vào clipboard
    const handleCopy = (text) => {
        navigator.clipboard.writeText(text);
        setCopiedItem(text);
        setTimeout(() => setCopiedItem(null), 2000); // Reset sau 2 giây
    };

    // Dừng fetch dữ liệu khi component unmount hoặc khi người dùng quay lại
    useEffect(() => {
        if (transactionFound && intervalId) {
            // Dừng interval khi tìm thấy giao dịch
            clearInterval(intervalId);
        }
    }, [transactionFound, intervalId]);

    useEffect(() => {
        if (transactionSuccess && orderId) {
            const updateOrderStatus = async () => {
                try {
                    // Cập nhật trạng thái đơn hàng thành "Completed"
                    await updatePaymentOrderStatus(orderId, 'Completed');

                    // Gọi hàm paymentSuccess để hoàn tất giao dịch
                    const paymentResult = await paymentSuccess(userId, userName, amount);

                    if (paymentResult.success) {
                        console.log(`Thanh toán thành công và trạng thái đơn hàng đã được cập nhật.`);
                    } else {
                        console.error('Có lỗi trong quá trình xử lý thanh toán thành công.');
                    }
                } catch (err) {
                    console.error(`Lỗi khi cập nhật trạng thái đơn hàng ${orderId}:`, err);
                }
            };

            updateOrderStatus();
        }
    }, [transactionSuccess, orderId, userId, userName, amount]);

    // Hàm xử lý captcha
    const handleCaptchaChange = (token) => {
        setCaptchaToken(token);
    };

    return (
        <div className="up-hongmoon-payment">
            {transactionSuccess ? (
                <div className="payment-success">
                    <div className="checkmark-container">
                        <div className="checkmark-circle">
                            <span className="checkmark">✔</span>
                        </div>
                    </div>
                    <h2>Giao Dịch Thành Công!</h2>
                    <p>Cảm ơn bạn đã ủng hộ!</p>
                    <button onClick={handleGoBackSuccess} className="up-hongmoon-back-button">
                        Quay lại
                    </button>
                </div>
            ) : (
                <>
                    <div className="up-hongmoon-back-container">
                        {isAmountConfirmed && (
                            <button onClick={handleGoBackGeneral} className="up-hongmoon-back-button">
                                <FaArrowLeft />
                            </button>
                        )}
                    </div>

                    {!isAmountConfirmed && (
                        <div className="up-hongmoon-payment-left">
                            <h3>Chọn Số Tiền Donate</h3>
                            <input
                                type="text"
                                placeholder="Nhập số tiền..."
                                value={amount}
                                onChange={handleAmountChange}
                                className="up-hongmoon-input"
                            />
                            <div className="up-hongmoon-predefined-amounts">
                                {predefinedAmounts.map((value) => (
                                    <button
                                        key={value}
                                        onClick={() => handleAmountClick(value)}
                                        className="up-hongmoon-amount-button"
                                    >
                                        {formatAmount(value)} VND
                                    </button>
                                ))}
                            </div>
                            <div className="up-hongmoon-captcha" style={{ marginTop: '10px', marginBottom: '15px' }}>
                                <ReCAPTCHA
                                    sitekey="6LeJMI4qAAAAAMl3NjToCLJmx7uwGohGpVt7DDJ7"
                                    onChange={handleCaptchaChange}
                                />
                            </div>
                            <button
                                onClick={handleConfirmAmount}
                                className="up-hongmoon-button"
                                disabled={!captchaToken}
                            >
                                Tiếp tục
                            </button>
                            {error && <p className="up-hongmoon-error">{error}</p>}
                        </div>
                    )}

                    {isAmountConfirmed && qrData ? (
                        <div className="up-hongmoon-qr-container">
                            {/* Cột phải: Hiển thị thông tin thanh toán */}
                            <div className="up-hongmoon-qr-column up-hongmoon-qr-right">
                                <h2>Thông Tin Chuyển Khoản</h2>
                                <p>Hỗ trợ Ví điện tử MoMo/ZaloPay hoặc ứng dụng ngân hàng để chuyển khoản nhanh 24/7</p>
                                <div className="account-info">
                                    <p>
                                        <strong>Chủ Tài Khoản:</strong> {qrData.accountName}
                                    </p>
                                    <p>
                                        <strong>Ngân Hàng:</strong> {qrData.bankName}
                                    </p>
                                    <p>
                                        <strong>Số Tài Khoản:</strong> {qrData.accountNo}
                                        <button
                                            onClick={() => handleCopy(qrData.accountNo)}
                                            className="payment-icon-button"
                                        >
                                            {copiedItem === qrData.accountNo ? <FaClipboardCheck /> : <FaCopy />}
                                        </button>
                                    </p>
                                    <p>
                                        <strong>Số Tiền:</strong> {formatAmount(qrData.amount)} ₫
                                        <button
                                            onClick={() => handleCopy(qrData.amount)}
                                            className="payment-icon-button"
                                        >
                                            {copiedItem === qrData.amount ? <FaClipboardCheck /> : <FaCopy />}
                                        </button>
                                    </p>
                                    <p>
                                        <strong>Nội Dung:</strong> <span className="highlight">{qrData.addInfo}</span>
                                        <button
                                            onClick={() => handleCopy(qrData.addInfo)}
                                            className="payment-icon-button"
                                        >
                                            {copiedItem === qrData.addInfo ? <FaClipboardCheck /> : <FaCopy />}
                                        </button>
                                    </p>
                                    <div className="payment-warning">
                                        <p>
                                            Lưu ý :{' '}
                                            <span className="highlight">
                                                Nhập chính xác nội dung và không tắt trình duyệt cho tới khi đơn hàng
                                                được xác nhận.
                                            </span>
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Cột trái: Hiển thị mã QR và các bước quét */}
                            <div className="up-hongmoon-qr-column up-hongmoon-qr-left">
                                <h2>Quét Mã QR</h2>
                                <p>
                                    <strong>Bước 1:</strong> Mở Ví điện tử/Ngân hàng
                                </p>
                                <p>
                                    <strong>Bước 2:</strong> Chọn và quét mã
                                </p>
                                <img src={qrData.qrDataURL} alt="QR Code" className="up-hongmoon-qr-image" />
                                <p>
                                    <strong>Bước 3:</strong> Xác Nhận Chuyển Khoản
                                </p>
                                <div style={{ marginTop: '20px' }}>
                                    <FerrisWheelSpinner color="#7c7c7c" size={40} />
                                </div>
                                {isAmountConfirmed && !transactionFound && (
                                    <div>
                                        <p>Thời gian còn lại: {formatTime(timeLeft)}</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : (
                        isAmountConfirmed && isQrLoading && <ClipLoader color="#7c7c7c" size={50} />
                    )}
                </>
            )}
        </div>
    );
};

export default PaymentScreen;
