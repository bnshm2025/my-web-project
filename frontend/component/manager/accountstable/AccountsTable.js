import React, { useState, useEffect } from 'react';
import './AccountsTable.css';
import { getAllUsers } from '../../../services/api/accountsManagerService';
import { ClipLoader } from 'react-spinners'; // Import spinner từ react-spinners

function AccountsTable() {
    const [users, setUsers] = useState([]); // Danh sách người dùng
    const [creatureCount, setCreatureCount] = useState(0); // Số lượng nhân vật
    const [deletedCreatureCount, setDeletedCreatureCount] = useState(0); // Số lượng nhân vật đã xóa
    const [isLoading, setIsLoading] = useState(true); // Trạng thái loading
    const [searchTerm, setSearchTerm] = useState(''); // Giá trị tìm kiếm

    // Lấy dữ liệu từ API khi component được mount
    useEffect(() => {
        setIsLoading(true); // Bắt đầu loading
        getAllUsers()
            .then((data) => {
                if (data && Array.isArray(data.users)) {
                    setUsers(data.users);
                    setCreatureCount(data.creatureCount);
                    setDeletedCreatureCount(data.deletedCreatureCount);
                } else {
                    console.error('Dữ liệu trả về không đúng định dạng:', data);
                }
            })
            .catch((error) => {
                console.error('Lỗi khi gọi API:', error);
            })
            .finally(() => {
                setIsLoading(false); // Kết thúc loading
            });
    }, []);

    // Lọc người dùng theo tên đăng nhập (Username) hoặc UserId
    const filteredUsers = users.filter((user) => {
        return (
            user.UserName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.UserId.toString().includes(searchTerm)
        );
    });

    return (
        <div className="accounts-container">
            <div className="accounts-content">
                {/* Header */}
                <div className="accounts-header-container mb-4">
                    <h1 className="accounts-header-title">Quản Lí Tài Khoản</h1>
                    <span className="accounts-account-count">
                        {' '}
                        Tài khoản: <span className="accounts-accounts-count">{filteredUsers.length}</span>{' '}
                    </span>
                    <span className="accounts-creature-count">
                        {' '}
                        | Nhân vật: <span className="accounts-created-count">{creatureCount}</span>{' '}
                    </span>
                    <span className="accounts-deleted-creature-count">
                        {' '}
                        | Nhân vật đã xóa: <span className="accounts-deleted-count">{deletedCreatureCount}</span>
                    </span>
                    <div className="accounts-search-container mb-4">
                        <input
                            type="text"
                            className="accounts-search-input"
                            placeholder="Tìm kiếm..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)} // Cập nhật giá trị tìm kiếm
                        />
                    </div>
                </div>

                {/* Hiển thị spinner nếu đang loading */}
                {isLoading ? (
                    <div className="spinner-container">
                        <ClipLoader color="#36d7b7" size={50} />
                    </div>
                ) : (
                    // Hiển thị bảng sau khi tải xong
                    <div className="accounts-table-container">
                        <table className="accounts-table table-striped table-bordered">
                            <thead>
                                <tr>
                                    <th>STT</th>
                                    <th>Username</th>
                                    <th>UserId</th>
                                    <th></th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredUsers.map((user, index) => (
                                    <tr key={user.UserId}>
                                        <td>{index + 1}</td>
                                        <td>{user.UserName}</td>
                                        <td>{user.UserId}</td>
                                        {/* <td class="button-group">
                                            <a
                                                href={`/edit-charhongmoon?userName=${user.UserName}`}
                                                className="btn-character  btn-edit"
                                            >
                                                Chỉnh sửa
                                            </a>

                                            <a 
                                                href={`/add-deposit?userId=${user.UserId}`}
                                                class="btn-character  btn-add"
                                            >
                                                Thêm kim cương
                                            </a>

                                        </td> */}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}

export default AccountsTable;
