const sql = require('mssql');
const { connectPlatformAcctDb, connectLobbyDB, connectBlGame, connectVirtualCurrencyDb } = require('../../config/db');

const getUserData = async (userName) => {
    let pool = null;
    try {
        // Kết nối với cơ sở dữ liệu PlatformAcctDb để lấy UserId
        pool = await connectPlatformAcctDb();
        const result = await pool
            .request()
            .input('userName', sql.NVarChar, userName)
            .query('SELECT UserId, UserName, LoginName, Created FROM Users WHERE UserName = @userName');

        const user = result.recordset[0];

        if (!user) {
            return { error: 'No user found' };
        }
        await pool.close();
        return { user };
    } catch (err) {
        console.error(err);
        return { error: 'Server error' };
    } finally {
        if (pool) await pool.close();
    }
};

const getGameAccountExp = async (userId) => {
    let pool = null;
    try {
        pool = await connectLobbyDB();
        const result = await pool
            .request()
            .input('gameAccountId', sql.UniqueIdentifier, userId)
            .query(
                'SELECT GameAccountID, AccountExp, AccountExpQuotaPerDay, LastUpdateTime FROM GameAccountExp WHERE GameAccountID = @gameAccountId',
            );
        const gameAccountExp = result.recordset || [];
        await pool.close();
        return { gameAccountExp };
    } catch (err) {
        console.error(err);
        return { error: 'Server error' };
    } finally {
        if (pool) await pool.close();
    }
};

const getCreaturesData = async (userId) => {
    let pool = null;
    try {
        pool = await connectBlGame();
        const result = await pool
            .request()
            .input('game_account_id', sql.UniqueIdentifier, userId)
            .query(`SELECT * FROM CreatureProperty WHERE game_account_id = @game_account_id`);
        const creatures = result.recordset || [];
        await pool.close();
        return { creatures };
    } catch (err) {
        console.error(err);
        return { error: 'Server error' };
    } finally {
        if (pool) await pool.close();
    }
};

const getDepositsData = async (userId) => {
    let pool = null;
    try {
        pool = await connectVirtualCurrencyDb();
        const result = await pool
            .request()
            .input('userId', sql.UniqueIdentifier, userId)
            .query('SELECT DepositId, Amount, Balance FROM Deposits WHERE UserId = @userId');
        const deposits = result.recordset || [];

        const totalBalance = deposits.reduce((acc, deposit) => acc + Number(deposit.Balance), 0);
        const totalAmount = deposits.reduce((acc, deposit) => acc + Number(deposit.Amount), 0);

        await pool.close();
        return { deposits, totalBalance, totalAmount };
    } catch (err) {
        console.error(err);
        return { error: 'Server error' };
    } finally {
        if (pool) await pool.close();
    }
};

const updateGameAccountExp = async (gameAccountId, accountExp, accountExpQuotaPerDay) => {
    let pool = null;
    try {
      // Kết nối cơ sở dữ liệu
      pool = await connectLobbyDB();
  
      // Tính toán thời gian hiện tại dưới dạng UNIX timestamp
      const currentTimestamp = Date.now();
  
      // Thực hiện truy vấn SQL
      const result = await pool.request()
        .input('gameAccountId', sql.UniqueIdentifier, gameAccountId)
        .input('accountExp', sql.BigInt, accountExp)
        .input('accountExpQuotaPerDay', sql.Int, accountExpQuotaPerDay)
        .input('lastUpdateTime', sql.BigInt, currentTimestamp)
        .query(`
          UPDATE GameAccountExp
          SET AccountExp = @accountExp,
              AccountExpQuotaPerDay = @accountExpQuotaPerDay,
              LastUpdateTime = @lastUpdateTime
          WHERE GameAccountID = @gameAccountId
        `);
  
      return result.rowsAffected[0];
    } catch (err) {
      console.error('Lỗi trong service updateGameAccountExp:', err.message);
      throw new Error('Lỗi khi cập nhật GameAccountExp.');
    } finally {
      if (pool) {
        try {
          await pool.close();
        } catch (closeErr) {
          console.error('Lỗi khi đóng kết nối cơ sở dữ liệu:', closeErr.message);
        }
      }
    }
  };
  

module.exports = {
    getUserData,
    getGameAccountExp,
    getCreaturesData,
    getDepositsData,
    updateGameAccountExp,
};
