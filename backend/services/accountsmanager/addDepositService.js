const sql = require('mssql');
const axios = require('axios');
const { connectPlatformAcctDb, connectVirtualCurrencyDb } = require('../../config/db');
const { cutStr } = require('../../utils/dataTransformations');

const ip = '127.0.0.1';
const service = 'VirtualCurrencySrv';



// Hàm kiểm tra userId trong cơ sở dữ liệu PlatformAcctDb
function checkUserId(userId) {
    let pool;
    return connectPlatformAcctDb()
        .then((connectedPool) => {
            pool = connectedPool;
            return pool.request()
                .input('userId', sql.VarChar, userId)
                .query('SELECT UserId FROM Users WHERE UserId = @userId');
        })
        .then((result) => {
            return result.recordset.length > 0;
        })
        .catch((error) => {
            console.error('Lỗi kiểm tra userId:', error);
            throw error;
        })
        .finally(() => {
            if (pool) {
                pool.close();
            }
        });
}

// Hàm lấy tên người dùng từ userId
function getUsernameByUserId(userId) {
    let pool;
    return connectPlatformAcctDb()
        .then((connectedPool) => {
            pool = connectedPool;
            return pool.request()
                .input('userId', sql.VarChar, userId)
                .query('SELECT UserName FROM Users WHERE UserId = @userId');
        })
        .then((result) => {
            return result.recordset[0] ? result.recordset[0].UserName : null;
        })
        .catch((error) => {
            console.error('Lỗi lấy tên người dùng:', error);
            throw error;
        })
        .finally(() => {
            if (pool) {
                pool.close();
            }
        });
}

// Hàm lấy dữ liệu khoản nạp từ VirtualCurrencyDb
function getDepositData(userId) {
    let pool;
    return connectVirtualCurrencyDb()
        .then((connectedPool) => {
            pool = connectedPool;
            return pool.request()
                .input('UserId', sql.UniqueIdentifier, userId)
                .query('SELECT SUM(Balance) AS totalBalance FROM [dbo].[Deposits] WHERE UserId = @UserId');
        })
        .then((balanceResult) => {
            const totalBalance = balanceResult.recordset[0] ? balanceResult.recordset[0].totalBalance : 0;

            return pool.request()
                .input('UserId', sql.UniqueIdentifier, userId)
                .query('SELECT DepositId, Amount FROM Deposits WHERE UserId = @UserId')
                .then((depositsResult) => {
                    const deposits = depositsResult.recordset || [];
                    const totalAmount = deposits.reduce((acc, deposit) => acc + Number(deposit.Amount), 0);

                    return { totalBalance, totalAmount, deposits };
                });
        })
        .catch((error) => {
            console.error('Lỗi lấy dữ liệu khoản nạp:', error);
            throw error;
        })
        .finally(() => {
            if (pool) {
                pool.close();
            }
        });
}

// Hàm gửi yêu cầu POST đến dịch vụ bên ngoài
function sendExternalServiceRequest(amount, gameAccountId) {
    return axios.get(`http://${ip}:6605/apps-state`)
        .then((response) => {
            const appResult = response.data;
            const resultApp = cutStr(`<AppName>${service}</AppName>`, `</App>`, appResult);
            const epoch = cutStr('<Epoch>', '</Epoch>', resultApp);

            const requestCode = Math.floor(Math.random() * 10000) + 1;
            const message = `<Request>
                <CurrencyId>13</CurrencyId>
                <Amount>${amount}</Amount>
                <EffectiveTo>2099-05-05T03:30:30+09:00</EffectiveTo>
                <IsRefundable>0</IsRefundable>
                <DepositReasonCode>5</DepositReasonCode>
                <DepositReason>입금사유</DepositReason>
                <RequestCode>${requestCode}</RequestCode>
                <RequestId>efb8205d-0261-aa9f-8709-aff33e052091</RequestId>
            </Request>`;

            return axios.post(
                `http://${ip}:6605/spawned/${service}.1.${epoch}/test/command_console`,
                null,
                {
                    params: {
                        protocol: 'VirtualCurrency',
                        command: 'Deposit',
                        from: '',
                        to: gameAccountId,
                        message: message,
                    },
                    headers: {
                        Accept: '*/*',
                        Connection: 'keep-alive',
                        Host: `${ip}:6605`,
                        Origin: `http://${ip}:6605`,
                        Referer: `http://${ip}:6605/spawned/${service}.1.${epoch}/test/`,
                        'User-Agent': 'Mozilla/5.0',
                    },
                }
            );
        })
        .then((postResponse) => {
            return postResponse.data;
        })
        .catch((error) => {
            console.error('Lỗi gửi yêu cầu đến dịch vụ bên ngoài:', error);
            throw error;
        });
}

module.exports = {
    cutStr,
    checkUserId,
    getUsernameByUserId,
    getDepositData,
    sendExternalServiceRequest,
};
