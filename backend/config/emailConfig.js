const nodemailer = require('nodemailer');
const { google } = require('googleapis');
const OAuth2 = google.auth.OAuth2;

// Tạo OAuth2 client với thông tin từ Google Cloud Console
const oauth2Client = new OAuth2(process.env.CLIENT_ID, process.env.CLIENT_SECRET, process.env.REDIRECT_URI);

oauth2Client.setCredentials({
    refresh_token: process.env.REFRESH_TOKEN,
});

// Hàm bất đồng bộ để lấy Access Token
async function getAccessToken() {
    try {
        const { token } = await oauth2Client.getAccessToken();
        return token;
    } catch (error) {
        console.error('Lỗi khi lấy Access Token:', error);
        throw new Error('Không thể lấy Access Token');
    }
}

// Cấu hình transporter của Nodemailer
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        type: 'OAuth2',
        user: process.env.EMAIL_USER,
        clientId: process.env.CLIENT_ID,
        clientSecret: process.env.CLIENT_SECRET,
        refreshToken: process.env.REFRESH_TOKEN,
        accessToken: async () => {
            return await getAccessToken(); // Gọi hàm lấy Access Token
        },
    },
    pool: true, // Sử dụng pool để tái sử dụng kết nối SMTP
    maxConnections: 5, // Tối đa 5 kết nối đồng thời
    maxMessages: 100, // Số email tối đa trên mỗi kết nối
});

module.exports = transporter;
