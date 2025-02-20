const { connectBNSPostsWebDb, sql } = require('../../config/db');

const checkRewardStatus = async (user_id, reward_day) => {
    try {
        const pool = await connectBNSPostsWebDb;
        const query = `
            SELECT claimed, character_name
            FROM users_rewards_thah
            WHERE user_id = @user_id AND reward_day = @reward_day
        `;

        const result = await pool
            .request()
            .input('user_id', sql.UniqueIdentifier, user_id)
            .input('reward_day', sql.Int, reward_day)
            .query(query);

        if (result.recordset.length === 0) {
            return { success: false, message: 'Không tìm thấy dữ liệu.' };
        }

        return { success: true, data: result.recordset[0] };
    } catch (error) {
        console.error('Lỗi khi kiểm tra trạng thái nhận thưởng:', error.message);
        return { success: false, message: 'Lỗi khi kiểm tra trạng thái nhận thưởng!' };
    }
};

const claimReward = async (user_id, reward_day, character_name) => {
    try {
        const pool = await connectBNSPostsWebDb;
        const query = `
            MERGE users_rewards_thah AS target
            USING (SELECT @user_id AS user_id, @reward_day AS reward_day) AS source
            ON (target.user_id = source.user_id AND target.reward_day = source.reward_day)
            WHEN MATCHED THEN
                UPDATE SET claimed = 1, claimed_at = GETDATE(), character_name = @character_name
            WHEN NOT MATCHED THEN
                INSERT (user_id, reward_day, character_name, claimed, claimed_at)
                VALUES (@user_id, @reward_day, @character_name, 1, GETDATE());
        `;

        await pool
            .request()
            .input('user_id', sql.UniqueIdentifier, user_id)
            .input('reward_day', sql.Int, reward_day)
            .input('character_name', sql.NVarChar, character_name)
            .query(query);

        return { success: true, message: 'Nhận phần thưởng thành công!' };
    } catch (error) {
        console.error('Lỗi khi xử lý claimReward:', error.message);
        return { success: false, message: 'Lỗi khi nhận phần thưởng!' };
    }
};

module.exports = { checkRewardStatus, claimReward };
