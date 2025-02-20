const sql = require('mssql');
const axios = require('axios');
const { connectPlatformAcctDb, connectVirtualCurrencyDb } = require('../../config/db');
const { cutStr } = require('../../utils/dataTransformations');
const xml2js = require('xml2js');

const ip = '127.0.0.1';
const service = 'VirtualCurrencySrv';

// Kiểm tra sự tồn tại của userId trong cơ sở dữ liệu PlatformAcctDb
async function checkUserIdExistence(userId) {
    let pool;
    try {
        // Kết nối tới cơ sở dữ liệu
        pool = await connectPlatformAcctDb();

        // Truy vấn dữ liệu
        const result = await pool
            .request()
            .input('userId', sql.UniqueIdentifier, userId)
            .query('SELECT UserId FROM Users WHERE UserId = @userId');

        // Trả về kết quả: true nếu tồn tại, false nếu không
        return result.recordset.length > 0;
    } catch (err) {
        console.error('Lỗi kết nối với cơ sở dữ liệu PlatformAcctDb:', err);
        throw err; // Đẩy lỗi lên để có thể xử lý ở nơi gọi hàm
    } finally {
        if (pool) pool.close(); // Đảm bảo đóng kết nối
    }
}

// Hàm processDeposit cập nhật trả về JSON
async function processDeposit(userId, amount) {
    const request_code = Math.floor(Math.random() * 10000) + 1;
    const postRequest = {
        protocol: 'VirtualCurrency',
        command: 'Deposit',
        from: '',
        to: userId,
        message: `<Request>
                    <CurrencyId>13</CurrencyId>
                    <Amount>${amount}</Amount>
                    <EffectiveTo>2099-05-05T03:30:30+09:00</EffectiveTo>
                    <IsRefundable>0</IsRefundable>
                    <DepositReasonCode>5</DepositReasonCode>
                    <DepositReason>입금사유</DepositReason>
                    <RequestCode>${request_code}</RequestCode>
                    <RequestId>efb8205d-0261-aa9f-8709-aff33e052091</RequestId>
                  </Request>`,
    };

    try {
        // Gửi yêu cầu lấy thông tin về ứng dụng
        const appResponse = await axios.get(`http://${ip}:6605/apps-state`);
        let resultapp = cutStr('<AppName>' + service + '</AppName>', '</App>', appResponse.data);
        resultapp = cutStr('<Epoch>', '</Epoch>', resultapp);

        // Gửi yêu cầu deposit
        const postResponse = await axios.post(
            `http://${ip}:6605/spawned/${service}.1.${resultapp}/test/command_console`,
            null,
            {
                params: {
                    protocol: postRequest.protocol,
                    command: postRequest.command,
                    from: postRequest.from,
                    to: postRequest.to,
                    message: postRequest.message,
                },
                headers: {
                    Accept: '*/*',
                    Connection: 'keep-alive',
                    Host: `${ip}:6605`,
                    Origin: `http://${ip}:6605`,
                    Referer: `http://${ip}:6605/spawned/${service}.1.${resultapp}/test/`,
                    'User-Agent': 'Mozilla/5.0',
                },
            },
        );

        // Phân tích cú pháp chuỗi XML trả về thành JSON
        const parser = new xml2js.Parser();
        const parsedData = await new Promise((resolve, reject) => {
            parser.parseString(postResponse.data, (err, result) => {
                if (err) reject(err);
                else resolve(result);
            });
        });

        // Kiểm tra nếu thành công
        if (parsedData && parsedData.Reply && parsedData.Reply.DepositId) {
            return {
                success: true,
                message: 'Deposit request successfully processed.',
            };
        } else {
            return {
                success: false,
                message: 'Không có DepositId trả về từ dịch vụ.',
            };
        }
    } catch (err) {
        console.error('Lỗi khi gửi yêu cầu deposit:', err);

        // Trả về lỗi dưới dạng JSON
        return {
            success: false,
            message: 'Đã xảy ra lỗi khi gửi yêu cầu deposit.',
            error: err.message, // Thông tin lỗi chi tiết
        };
    }
}

module.exports = {
    checkUserIdExistence,

    processDeposit,
};
