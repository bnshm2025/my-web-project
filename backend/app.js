const express = require('express');
const cors = require('cors');
const path = require('path');
const cookieParser = require('cookie-parser');
const postRoutes = require('./routes/post/postRoutes');
const signupRoutes = require('./routes/signup/signupRoutes');
const emailRoutes = require('./routes/email/emailRoutes');
const checkAvailabilityRoutes = require('./routes/checkAvailability/checkAvailabilityRoutes');
const signinRoutes = require('./routes/signin/signinRoutes');
const profileRoutes = require('./routes/profile/profileRoutes');
const vietqrRoutes = require('./routes/Transactions/transactionsRouter');
const searchRoutes = require('./routes/search/searchRoutes');
const accountsManagerRoutes = require('./routes/accountsmanager/accountManagerRoutes');
const editCharacterRoutes = require('./routes/accountsmanager/editCharacterRoutes');
const updateCharacterRoutes = require('./routes/accountsmanager/updateCharacterRoutes');
const addDepositRoutes = require('./routes/accountsmanager/addDepositRoutes');
const changePasswordRoutes = require('./routes/password/changePasswordRoutes');
const changeEmailRoutes = require('./routes/email/changeEmailRoutes');
const exchangehmcoinRoutes = require('./routes/exchangehmcoin/exchangehmcoinRoutes');
const forgotPasswordRoutes = require('./routes/password/forgotPasswordRoutes');
const updateLauncherRoutes = require('./routes/update/updateRouter');
const dataUpdateRoutes = require('./routes/update/dataUpdateRouter');
const sendItemsRoutes = require('./routes/sendItems/sendItemsRoutes');
const evTHAHRoutes = require('./routes/events/evTHAHRouter');
const evQDHMRoutes = require('./routes/events/evQDHMRouter');
const storeManagementRoutes = require('./routes/storeManagement/storeManagementRoutes');

const helmet = require('helmet');

const app = express();

// Sử dụng middleware
app.use(
    cors({
        origin: 'https://bns911.com',
        credentials: true,
    }),
);
app.use(express.json());
app.use(helmet());
app.use(cookieParser());

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', 'https://bns911.com'); // Địa chỉ client cụ thể
    res.setHeader('Access-Control-Allow-Credentials', 'true'); // Cho phép gửi cookie
    next();
});


// Cấu hình để phục vụ file tĩnh trong thư mục 'updates'
app.use('/updates', express.static(path.join(__dirname, '../updates')));

// Thiết lập các file tĩnh cho frontend
app.use(express.static(path.join(__dirname, '../build')));

// Đường dẫn tới thư mục chứa các tệp vá
const patchesDir = path.join(__dirname, '../patches');

// Route để tải xuống tệp game1-patch2.7z
app.get('/download/data', (req, res) => {
    const file = path.join(patchesDir, 'data.7z');
    res.download(file, (err) => {
        if (err) {
            console.error('Lỗi khi tải tệp:', err);
            res.status(500).send('Đã xảy ra lỗi khi tải tệp.');
        }
    });
});

// Sử dụng các route cho API
app.use(
    '/api',
    postRoutes,
    signupRoutes,
    emailRoutes,
    checkAvailabilityRoutes,
    signinRoutes,
    profileRoutes,
    vietqrRoutes,
    searchRoutes,
    accountsManagerRoutes,
    editCharacterRoutes,
    updateCharacterRoutes,
    addDepositRoutes,
    changePasswordRoutes,
    changeEmailRoutes,
    exchangehmcoinRoutes,
    forgotPasswordRoutes,
    updateLauncherRoutes,
    dataUpdateRoutes,
    sendItemsRoutes,
    evTHAHRoutes,
    evQDHMRoutes,
    storeManagementRoutes,
);

// Route tất cả các yêu cầu khác tới index.html
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../build', 'index.html'));
});

module.exports = app;
