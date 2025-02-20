import React, { useState, useEffect } from 'react';
import { getDepositInfo, addDeposit } from '../../../services/api/addDepositService';
import { useLocation } from 'react-router-dom';
import './AddDeposit.css';
import { useNavigate } from 'react-router-dom';
import logo from '../../../assets/money/Diamond.png';

const AddDeposit = () => {
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const userId = queryParams.get('userId'); // Lấy userId từ query string

    const [userName, setUserName] = useState('');
    const [totalAmount, setTotalAmount] = useState(0);
    const [totalBalance, setTotalBalance] = useState(0);
    const [amount, setAmount] = useState('');
    const [message, setMessage] = useState('');
    const maxAmount = 999999999999; // Giá trị tối đa có thể nạp

    const navigate = useNavigate();

    // Lấy thông tin khoản nạp khi component được mount
    useEffect(() => {
        const fetchDepositInfo = async () => {
            try {
                const data = await getDepositInfo(userId);
                setUserName(data.username);
                setTotalAmount(data.totalAmount);
                setTotalBalance(data.totalBalance);
            } catch (error) {
                setMessage(error.message || 'Lỗi khi tải thông tin nạp kim cương.');
            }
        };

        fetchDepositInfo();
    }, [userId]);

    const handleBackClick = () => {
        navigate('/admin-manager#accountManagement');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const data = await addDeposit(amount, userId);
            setTotalAmount(data.totalAmount);
            setTotalBalance(data.totalBalance);
            showToast('success', amount);
        } catch (error) {
            showToast('error', error.message || 'Đã xảy ra lỗi khi thêm nạp kim cương.');
        }
    };

    const handleAmountChange = (e) => {
        const value = parseFloat(e.target.value);
        if (value > maxAmount) {
            alert(`Giá trị tối đa được phép: ${maxAmount}.`);
            setAmount(maxAmount);
        } else {
            setAmount(value);
        }
    };

    const showToast = (type, content) => {
        const message = type === 'success' ? `Đã thêm nạp kim cương thành công: ${content} Kim Cương!` : content;
        setMessage(message);

        setTimeout(() => {
            setMessage('');
        }, 3000);
    };

    return (
        <div className="container">
            <button onClick={handleBackClick} className="btn btn-secondary">
                Quay lại
            </button>

            <h1 className="mb-4">
                Nạp Kim cương cho <span className="userName">{userName}</span>
            </h1>
            <h4>UserId: {userId}</h4>

            <div className="card mb-4">
                <div className="card-header deposit-header">
                    <p>Thông Tin</p>
                </div>
                <div className="card-body">
                    <table className="table">
                        <thead>
                            <tr>
                                <th>Tổng Số kim cương</th>
                                <th>Tổng Số Dư</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>
                                    <div className="Amount-content">
                                        <p>{totalAmount}</p>
                                        <img src={logo} alt="B&SCoin" style={{ width: '24px', height: '24px' }} />
                                    </div>
                                </td>
                                <td>
                                    <div className="Amount-content">
                                        <p>{totalBalance}</p>
                                        <img src={logo} alt="B&SCoin" style={{ width: '24px', height: '24px' }} />
                                    </div>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

            <h4 className="mb-4">
                <span className="addeposit">Nạp kim cương</span>
            </h4>

            <div className="card">
                <form className="form-add" onSubmit={handleSubmit}>
                    <input type="hidden" name="game_account_id" value={userId} />
                    <div className="form-group">
                        <label>Số kim cương</label>
                        <input
                            type="number"
                            className="form-control"
                            name="amount"
                            value={amount}
                            min="0"
                            max={maxAmount}
                            onChange={handleAmountChange}
                            required
                        />
                        <p className="description mt-2">
                            Nhập số kim cương bạn muốn thêm. Tối thiểu: 0, tối đa: {maxAmount}
                        </p>
                    </div>
                    <div className="update-button-container">
                        <button type="submit" className="btn btn-primary">
                            Nạp kim cương
                        </button>
                    </div>
                </form>
            </div>

            {message && (
                <div className={`toast alert alert-${message.includes('thành công') ? 'success' : 'danger'}`}>
                    {message}
                </div>
            )}
        </div>
    );
};

export default AddDeposit;
