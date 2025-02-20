const { google } = require('googleapis');
const OAuth2 = google.auth.OAuth2;

// Khai báo thông tin OAuth2 từ Google Cloud Console
const oauth2Client = new OAuth2(process.env.CLIENT_ID, process.env.CLIENT_SECRET, process.env.REDIRECT_URI);

// Hàm để lấy `refreshToken`
async function getNewToken() {
    const authUrl = oauth2Client.generateAuthUrl({
        access_type: 'offline', // Cần có để nhận `refreshToken`
        scope: ['https://www.googleapis.com/auth/gmail.send'], // Quyền gửi email
    });
    console.log('Truy cập vào URL này để cấp quyền:', authUrl);

    // Sau khi truy cập vào URL, Google sẽ chuyển hướng đến `REDIRECT_URI` với `authorization code` ở URL.
    console.log('Nhập mã xác thực (authorization code) mà bạn nhận được từ URL sau khi cấp quyền:');

    // Sử dụng `readline` để nhập mã từ console
    const readline = require('readline');
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });

    rl.question('Nhập mã xác thực: ', async (code) => {
        try {
            const { tokens } = await oauth2Client.getToken(code);
            console.log('Access token:', tokens.access_token);
            console.log('Refresh token:', tokens.refresh_token);

            // Lưu `refreshToken` vào `.env` hoặc cấu hình của bạn
            console.log('Lưu refresh token vào biến môi trường hoặc nơi an toàn để sử dụng sau này.');
        } catch (error) {
            console.error('Lỗi khi lấy mã token:', error);
        } finally {
            rl.close();
        }
    });
}

getNewToken();
