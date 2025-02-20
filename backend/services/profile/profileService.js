const { connectPlatformAcctDb, connectBlGame, connectVirtualCurrencyDb, connectBNSWebDb } = require('../../config/db');
const sql = require('mssql');
const {
    convertFaction,
    convertSex,
    convertRace,
    convertMoney,
    convertJob,
} = require('../../utils/dataTransformations');

async function getUserByUsername(userName) {
    const pool = await connectPlatformAcctDb();
    try {
        const result = await pool
            .request()
            .input('userName', sql.NVarChar, userName)
            .query('SELECT UserId, UserName, Email, Created FROM Users WHERE UserName = @userName');
        return result.recordset[0];
    } finally {
        pool.close();
    }
}

async function getCreaturesByUserId(userId) {
    const pool = await connectBlGame();
    try {
        const result = await pool.request().input('game_account_id', sql.UniqueIdentifier, userId).query(`
                SELECT 
                pcid, game_account_id, world_id, race, sex, job, 
                name, yaw, level, exp, mastery_level, mastery_exp, hp, 
                money, money_diff, faction, faction2, faction_reputation, 
                inventory_size, depository_size, wardrobe_size, 
                premium_depository_size, acquired_skill_build_up_point, 
                account_exp_to_add, account_exp_added, account_exp_added_time, 
                account_exp_by_pc, activated_badge_page, pvp_mode, 
                guild_invitation_refusal, slate_page, guild_point
                FROM CreatureProperty 
                WHERE game_account_id = @game_account_id AND deletion != 1`);

        // Chỉnh sửa game_account_id trước khi trả về kết quả
        return result.recordset.map((creature) => ({
            ...creature,
            game_account_id: convertFaction(creature.game_account_id), // Định dạng lại game_account_id
            faction: convertFaction(creature.faction).name,
            factionImageUrl: convertFaction(creature.faction).imageUrl,
            sex: convertSex(creature.sex).name,
            sexImageUrl: convertSex(creature.sex).imageUrl,
            race: convertRace(creature.race).name,
            raceImageUrl: convertRace(creature.race).imageUrl,
            job: convertJob(creature.job).name,
            jobImageUrl: convertJob(creature.job).imageUrl,
            money: convertMoney(creature.money),
        }));
    } finally {
        pool.close();
    }
}

async function getDepositsByUserId(userId) {
    const pool = await connectVirtualCurrencyDb();
    try {
        const result = await pool
            .request()
            .input('userId', sql.UniqueIdentifier, userId)
            .query('SELECT Amount, Balance FROM Deposits WHERE UserId = @userId');
        return result.recordset;
    } finally {
        pool.close();
    }
}

async function getHMCoinByUserId(userId) {
    const pool = await connectBNSWebDb(); // Kết nối với cơ sở dữ liệu BNSWebDb
    try {
        // Thực hiện truy vấn để lấy HongMoonCoin
        const result = await pool
            .request()
            .input('userId', sql.UniqueIdentifier, userId)
            .query('SELECT HongMoonCoin FROM HMCoin WHERE UserId = @userId');

        // Kiểm tra nếu không có kết quả
        if (result.recordset.length === 0) {
            return null; // Hoặc trả về một giá trị mặc định, ví dụ: 0
        }

        // Trả về giá trị HongMoonCoin
        return result.recordset[0].HongMoonCoin;
    } finally {
        pool.close();
    }
}

async function getTransactionHistoryByUserId(userId) {
    const pool = await connectBNSWebDb(); // Kết nối với cơ sở dữ liệu BNSWebDb
    try {
        // Truy vấn chỉ lấy các cột cần thiết với trạng thái 'Completed' và lọc theo userId
        const result = await pool.request().input('userId', sql.UniqueIdentifier, userId).query(`
                SELECT 
                    UserName, AddInfo, Amount, CreatedAt
                FROM PaymentOrders 
                WHERE UserId = @userId AND Status = 'Completed'
                ORDER BY CreatedAt DESC
            `);

        // Kiểm tra nếu không có giao dịch nào
        if (result.recordset.length === 0) {
            return []; // Trả về mảng rỗng nếu không có giao dịch
        }

        // Trả về danh sách các giao dịch
        return result.recordset.map((order) => ({
            userName: order.UserName,
            addInfo: order.AddInfo,
            amount: order.Amount,
            createdAt: order.CreatedAt,
        }));
    } finally {
        pool.close();
    }
}

async function deleteFailedPayments() {
    const pool = await connectBNSWebDb();
    try {
        const result = await pool.request().query(`
            DELETE FROM PaymentOrders 
            WHERE Status = 'Failed' AND DATEDIFF(hour, CreatedAt, GETDATE()) >= 24
            
        `);
        // WHERE Status = 'Failed' AND DATEDIFF(minute, CreatedAt, GETDATE()) >= 1


        return result.rowsAffected[0]; // Số lượng bản ghi đã xóa
    } finally {
        pool.close();
    }
}


module.exports = {
    getUserByUsername,
    getCreaturesByUserId,
    getDepositsByUserId,
    getHMCoinByUserId,
    getTransactionHistoryByUserId,

    deleteFailedPayments,
};
