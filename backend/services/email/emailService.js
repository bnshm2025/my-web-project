const transporter = require('../../config/emailConfig');
const NodeCache = require('node-cache');
const bcrypt = require('bcrypt');
const { connectAcctWebDb, sql } = require('../../config/db');

// Tạo cache với thời gian hết hạn 5 phút (300 giây)
const cache = new NodeCache({ stdTTL: 300, checkperiod: 60 }); // `stdTTL` là thời gian hết hạn mặc định

// Hàm tạo mã xác nhận
const generateVerificationCode = () => {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 6; i++) {
        code += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    console.log(`Mã xác nhận được tạo: ${code}`);
    return code;
};

// Hàm gửi email xác nhận
const sendVerificationEmail = async (recipientEmail) => {
    const verificationCode = generateVerificationCode();

    // Lưu mã xác nhận vào cache
    cache.set(recipientEmail, verificationCode);
    console.log(`Mã xác nhận ${verificationCode} được lưu cho email: ${recipientEmail} với thời gian hết hạn 5 phút`);

    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: recipientEmail,
        subject: 'Xác nhận tài khoản của bạn',
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; background-color: #ffffff; padding: 20px; color: #333; border: 1px solid #ddd; border-radius: 8px;">
                <div style="text-align: center; padding-bottom: 20px;">
                    <h2 style="color: #333; font-size: 24px; margin: 0;">Xác nhận tài khoản của bạn</h2>
                    <p style="font-size: 14px; color: #555;">Cảm ơn bạn đã sử dụng dịch vụ!</p>
                </div>
                <p style="font-size: 16px; line-height: 1.6; color: #333;">
                    Để hoàn tất quá trình, vui lòng nhập mã xác nhận bên dưới:
                </p>
                <div style="text-align: center; margin: 20px 0;">
                    <div style="display: inline-block; background-color: #f9f9f9; padding: 15px 30px; border-radius: 8px; border: 1px solid #ddd; font-size: 24px; font-weight: bold; color: #333;">
                        ${verificationCode}
                    </div>
                </div>
                <p style="font-size: 16px; line-height: 1.6; color: #333;">
                    Mã xác nhận này có hiệu lực trong <strong>5 phút</strong>. Nếu mã hết hạn, bạn có thể yêu cầu mã mới.
                </p>
                <p style="font-size: 16px; line-height: 1.6; color: #333;">
                    Nếu bạn không yêu cầu OTP, vui lòng bỏ qua email này hoặc liên hệ với chúng tôi nếu bạn cần hỗ trợ.
                </p>
                <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
                <div style="text-align: center;">
                    <p style="font-size: 14px; color: #888; font-weight: bold;">Trân trọng,<br>BNS 911Cafe</p>
                    <div style="margin-top: 20px; font-size: 14px; color: #888;">
                        <p style="font-size: 14px; color: #333; font-weight: bold;">Liên Hệ Với Chúng Tôi:</p>
                        <p>Gmail: <a href="mailto:bns911cafe@gmail.com" style="color: #555; text-decoration: none;">bns911cafe@gmail.com</a></p>
                        <p>Discord: <a href="https://discord.gg/ZWkXzXdBBn" target="_blank" style="color: #555; text-decoration: none;">Blade & Soul 911</a></p>
                        <p>Facebook: <a href="https://www.facebook.com/profile.php?id=61567494682969" target="_blank" style="color: #555; text-decoration: none;">Blade and Soul 911 </a></p>
                    </div>
                    <p style="font-size: 12px; color: #aaa; margin-top: 20px;">
                        <em>Đây là email tự động, vui lòng không trả lời trực tiếp email này.</em>
                    </p>
                    <p style="font-size: 12px; color: #aaa;">
                        © 2025 BNS 911Cafe. Mọi quyền được bảo lưu.
                    </p>
                </div>
            </div>
        `,
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`Email xác nhận đã được gửi đến: ${recipientEmail}`);
    } catch (error) {
        console.error('Lỗi khi gửi email:', error);
        throw error;
    }
};

// Hàm gửi email chứa mã xác nhận và mật khẩu
const sendForgotPassword = async (recipientEmail) => {
    let pool;
    try {
        pool = await connectAcctWebDb();

        // Kiểm tra nếu email tồn tại trong cơ sở dữ liệu
        const userResult = await pool.request().input('identifier', sql.NVarChar, recipientEmail).query(`
                SELECT UserName, WebsitePassword
                FROM dbo.Users
                WHERE Email = @identifier
            `);

        // Nếu không tìm thấy email, trả về lỗi
        if (userResult.recordset.length === 0) {
            return { success: false, message: 'Email không tồn tại trong hệ thống.' };
        }

        const userRecord = userResult.recordset[0];
        const decryptedPassword = userRecord.WebsitePassword;

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: recipientEmail,
            subject: 'Khôi phục mật khẩu tài khoản của bạn',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; background-color: #ffffff; padding: 20px; color: #333; border: 1px solid #ddd; border-radius: 8px;">
                    <div style="text-align: center; padding-bottom: 20px;">
                        <h2 style="color: #333; font-size: 24px; margin: 0;">Khôi phục mật khẩu tài khoản</h2>
                    </div>
                    <p style="font-size: 16px; line-height: 1.6; color: #333;">
                        Chúng tôi đã nhận được yêu cầu khôi phục mật khẩu của bạn. Dưới đây là mật khẩu hiện tại của bạn:
                    </p>
                    <div style="text-align: center; margin: 20px 0;">
                        <div style="display: inline-block; background-color: #f9f9f9; padding: 15px 30px; border-radius: 8px; border: 1px solid #ddd; font-size: 24px; font-weight: bold; color: #333;">
                            ${decryptedPassword}
                        </div>
                    </div>
                    <p style="font-size: 16px; line-height: 1.6; color: #333;">
                        Để bảo mật tài khoản của bạn, chúng tôi khuyến khích bạn đăng nhập và thay đổi mật khẩu ngay sau khi nhận được email này.
                    </p>
                    <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
                    <div style="text-align: center;">
                        <p style="font-size: 14px; color: #888; font-weight: bold;">Trân trọng,<br>BNS 911Cafe</p>
                        <div style="margin-top: 20px; font-size: 14px; color: #888;">
                            <p style="font-size: 14px; color: #333; font-weight: bold;">Liên Hệ Với Chúng Tôi:</p>
                            <p>Gmail: <a href="mailto:bns911cafe@gmail.com" style="color: #555; text-decoration: none;">bns911cafe@gmail.com</a></p>
                            <p>Discord: <a href="https://discord.gg/ZWkXzXdBBn" target="_blank" style="color: #555; text-decoration: none;">Blade & Soul 911</a></p>
                            <p>Facebook: <a href="https://www.facebook.com/profile.php?id=61567494682969" target="_blank" style="color: #555; text-decoration: none;">Blade and Soul 911</a></p>
                        </div>
                        <p style="font-size: 12px; color: #aaa; margin-top: 20px;">
                            <em>Đây là email tự động, vui lòng không trả lời trực tiếp email này.</em>
                        </p>
                        <p style="font-size: 12px; color: #aaa;">
                            © 2025 BNS 911Cafe. Mọi quyền được bảo lưu.
                        </p>
                    </div>
                </div>
            `,
        };

        await transporter.sendMail(mailOptions);

        return { success: true, message: 'Mật khẩu đã được gửi qua email.' };
    } catch (error) {
        console.error('Error during password retrieval:', error.message);
        return { success: false, message: 'Có lỗi xảy ra trong quá trình khôi phục mật khẩu.' };
    } finally {
        if (pool) {
            pool.close();
        }
    }
};

// Hàm kiểm tra mã xác nhận
const verifyCode = (recipientEmail, code) => {
    const storedCode = cache.get(recipientEmail);
    console.log(`Mã được kiểm tra: ${code} cho email: ${recipientEmail}`);

    if (storedCode && storedCode === code) {
        console.log(`Mã xác nhận chính xác cho email: ${recipientEmail}`);
        cache.del(recipientEmail); // Xóa mã sau khi xác nhận thành công
        return true;
    } else {
        console.log(`Mã xác nhận không hợp lệ hoặc đã hết hạn cho email: ${recipientEmail}`);
    }
    return false;
};

module.exports = {
    sendVerificationEmail,
    sendForgotPassword,
    verifyCode,
};
