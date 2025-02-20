import React, { useEffect, Suspense, lazy } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Trang chính được tải ngay lập tức
import Home from './component/home/home';

// Lazy Load cho các trang ít được truy cập
const AdminManager = lazy(() => import('./component/manager/AdminManager'));
const NewsMain = lazy(() => import('./component/newsmain/NewsMain'));
const NewsDetail = lazy(() => import('./component/newsmain/NewsDetail'));
const SignInForm = lazy(() => import('./component/SignIn_Up/SignInForm/SignInForm'));
const SignUpForm = lazy(() => import('./component/SignIn_Up/SignUpForm/SignUpForm'));
const UserProfile = lazy(() => import('./component/UserProfile/UserProfile'));
const SearchResultsPage = lazy(() => import('./component/SearchResultsPage/SearchResultsPage'));
const EditCharacter = lazy(() => import('./component/manager/accountstable/EditCharacter'));
const AddDeposit = lazy(() => import('./component/manager/accountstable/AddDeposit'));
const Store = lazy(() => import('./component/store/Store'));


function App() {
    // Thêm sự kiện beforeunload để xóa cookies khi đóng tab
    // useEffect(() => {
    //     // Tăng số lượng tab khi tab mới được mở
    //     const incrementTabCount = () => {
    //         const tabCount = parseInt(localStorage.getItem('tabCount') || '0', 10);
    //         localStorage.setItem('tabCount', tabCount + 1);
    //     };

    //     // Giảm số lượng tab khi tab được đóng
    //     const decrementTabCount = () => {
    //         const tabCount = parseInt(localStorage.getItem('tabCount') || '0', 10);
    //         if (tabCount <= 1) {
    //             // Xóa cookie khi không còn tab nào mở
    //             document.cookie = 'authToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    //             localStorage.removeItem('tabCount');
    //         } else {
    //             localStorage.setItem('tabCount', tabCount - 1);
    //         }
    //     };

    //     incrementTabCount();

    //     window.addEventListener('beforeunload', decrementTabCount);

    //     return () => {
    //         window.removeEventListener('beforeunload', decrementTabCount);
    //         decrementTabCount(); // Đảm bảo giảm số lượng tab khi component bị gỡ bỏ
    //     };
    // }, []);

    return (
        <Router
            future={{
                v7_startTransition: true, // Bật tính năng startTransition
                v7_relativeSplatPath: true, // Bật cách xử lý mới cho Splat routes
            }}
        >
            <ToastContainer
                position="top-right"
                autoClose={3000}
                hideProgressBar={false}
                style={{ marginTop: '70px' }}
            />
            <Suspense fallback={<div>Loading...</div>}>
                <Routes>
                    {/* Trang chính được tải ngay lập tức */}
                    <Route path="/" element={<Home />} />

                    {/* Các trang lazy load */}
                    <Route path="/admin-manager" element={<AdminManager />} />
                    <Route path="/edit-charhongmoon" element={<EditCharacter />} />
                    <Route path="/add-deposit" element={<AddDeposit />} />
                    <Route path="/user/profile" element={<UserProfile />} />
                    
                    <Route path="/Store" element={<Store />} />

                    <Route path="/user/signin" element={<SignInForm />} />
                    <Route path="/user/signup" element={<SignUpForm />} />
                    <Route path="/news" element={<NewsMain />} />
                    <Route path="/news/:slug" element={<NewsDetail />} />

                    {/* Route trang tìm kiếm */}
                    <Route path="/search" element={<SearchResultsPage />} />
                </Routes>
            </Suspense>
        </Router>
    );
}

export default App;
