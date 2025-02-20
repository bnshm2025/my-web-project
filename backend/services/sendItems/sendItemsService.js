const { connectBlGame, connectGameWarehouseDb, sql } = require('../../config/db');

const GOODID_CONTAINER = 80405;

// Hàm lấy game_account_id
async function getOwnerAccId(charname) {
    let pool;
    try {
        pool = await connectBlGame();
        const result = await pool
            .request()
            .input('charnameParam', sql.VarChar, charname)
            .query('SELECT game_account_id FROM CreatureProperty WHERE name = @charnameParam');
        return result.recordset.length ? result.recordset[0].game_account_id : '';
    } finally {
        if (pool) await pool.close();
    }
}

// Hàm lấy PCID
async function getOwneraccPCID(charname) {
    let pool;
    try {
        pool = await connectBlGame();
        const result = await pool
            .request()
            .input('charnameParam', sql.VarChar, charname)
            .query('SELECT pcid FROM CreatureProperty WHERE name = @charnameParam');
        return result.recordset.length ? parseInt(result.recordset[0].pcid, 10) : null;
    } finally {
        if (pool) await pool.close();
    }
}

// Hàm lấy world_id
async function getOwneraccWID(charname) {
    let pool;
    try {
        pool = await connectBlGame();
        const result = await pool
            .request()
            .input('charnameParam', sql.VarChar, charname)
            .query('SELECT world_id FROM CreatureProperty WHERE name = @charnameParam');
        return result.recordset.length ? parseInt(result.recordset[0].world_id, 10) : null;
    } finally {
        if (pool) await pool.close();
    }
}

// Hàm lấy GoodsID tiếp theo
async function getNextGoodsId() {
    let pool;
    try {
        pool = await connectGameWarehouseDb();
        const result = await pool.request().query('SELECT max(GoodsID) AS maxGoodsID FROM WarehouseGoods');
        return result.recordset.length ? parseInt(result.recordset[0].maxGoodsID, 10) + 1 : 1;
    } finally {
        if (pool) await pool.close();
    }
}

// Hàm cập nhật trạng thái trong WarehouseGoods và WarehouseItem
async function updateWHState(newLabelID) {
    let pool;
    try {
        pool = await connectGameWarehouseDb();

        // Cập nhật WarehouseGoods
        await pool.request().query(`UPDATE WarehouseGoods SET RegistrationState = 2 WHERE LabelID = ${newLabelID}`);

        // Cập nhật WarehouseItem
        await pool.request().query(`UPDATE WarehouseItem SET ItemState = 1 WHERE LabelID = ${newLabelID}`);

        return { success: true, message: 'update_whstate completed' };
    } finally {
        if (pool) await pool.close();
    }
}

module.exports = {
    getOwnerAccId,
    getOwneraccPCID,
    getOwneraccWID,
    getNextGoodsId,
    updateWHState,
    GOODID_CONTAINER,
};
