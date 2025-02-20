import React, { useState, useEffect } from 'react';
import './AdminManager.css';
import NewsTable from './newstable/NewsTable';
import AccountsTable from './accountstable/AccountsTable';
import StoresManagement from './storeManagement/StoreManagement';

function AdminManager() {
    const [isPostManagementOpen, setPostManagementOpen] = useState(false);
    const [isUserManagementOpen, setUserManagementOpen] = useState(false);
    const [selectedMenu, setSelectedMenu] = useState(null);

    useEffect(() => {
        // Cập nhật selectedMenu từ hash trong URL
        const hash = window.location.hash.replace('#', '');
        if (hash) {
            setSelectedMenu(hash);
        }
    }, []);

    useEffect(() => {
        // Cập nhật hash trong URL khi selectedMenu thay đổi
        if (selectedMenu) {
            window.location.hash = selectedMenu;
        }
    }, [selectedMenu]);

    const togglePostManagement = () => {
        setPostManagementOpen(!isPostManagementOpen);
    };

    const toggleUserManagement = () => {
        setUserManagementOpen(!isUserManagementOpen);
    };

    const selectNewsMenu = () => {
        setSelectedMenu('news');
    };

    const selectAccountManagement = () => {
        setSelectedMenu('accountManagement');
    };

    const selectStoreManagement = () => {
        setSelectedMenu('storeManagement');
    };

    return (
        <div className="admin-container">
            <div className="admin-sidebar">
                <div className="admin-logo">
                    <h2>Logo</h2>
                </div>
                <ul className="admin-menu">
                    <li
                        onClick={togglePostManagement} // Mở menu khi nhấp vào "Quản lí bài viết"
                        className={isPostManagementOpen ? 'active' : ''}
                        style={{ cursor: 'pointer' }}
                    >
                        Quản lí bài viết
                    </li>
                    {isPostManagementOpen && (
                        <ul className="admin-submenu">
                            <li onClick={selectNewsMenu} style={{ cursor: 'pointer' }}>
                                Tin Tức
                            </li>
                            <li>Sự Kiện</li>
                        </ul>
                    )}
                    <li
                        onClick={toggleUserManagement} // Mở menu khi nhấp vào "Quản lí người dùng"
                        className={isUserManagementOpen ? 'active' : ''}
                        style={{ cursor: 'pointer' }}
                    >
                        Quản lí người dùng
                    </li>
                    {isUserManagementOpen && (
                        <ul className="admin-submenu">
                            <li onClick={selectAccountManagement} style={{ cursor: 'pointer' }}>
                                Quản lí tài khoản
                            </li>
                        </ul>
                    )}

                    <li  onClick={() => selectStoreManagement('storeManagement')} style={{ cursor: 'pointer' }}>
                        Quản lí cửa hàng
                    </li>
                    <li>Đăng xuất</li>
                </ul>
            </div>
            <div className="admin-content">
                {selectedMenu === 'news' ? (
                    <>
                        <h1>Danh sách bài đăng</h1>
                        <NewsTable />
                    </>
                ) : selectedMenu === 'accountManagement' ? (
                    <>
                        <AccountsTable />
                    </>
                ) : selectedMenu === 'storeManagement' ? (
                    <>
                        <StoresManagement />
                    </>
                ) : (
                    <>
                        <h1>Welcome to the Admin Dashboard</h1>
                        <p>This is where you can manage your business settings and monitor performance.</p>
                    </>
                )}
            </div>
        </div>
    );
}

export default AdminManager;
