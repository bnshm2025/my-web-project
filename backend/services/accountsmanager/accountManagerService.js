const sql = require('mssql');
const { connectBlGame, connectPlatformAcctDb } = require('../../config/db');

const getUsers = async () => {
    let pool = null;
    try {
        pool = await connectPlatformAcctDb();
        const result = await pool.request().query('SELECT UserId, UserName FROM Users');
        return result.recordset; // Trả về danh sách người dùng
    } catch (err) {
        throw new Error('Không thể lấy dữ liệu người dùng');
    } finally {
        if (pool) {
            await pool.close();
        }
    }
};

const getCreatureCount = async () => {
    let pool = null;
    try {
        pool = await connectBlGame();
        const result = await pool.request().query('SELECT COUNT(name) AS CreatureCount FROM CreatureProperty');
        return result.recordset[0].CreatureCount; // Trả về số lượng nhân vật
    } catch (err) {
        throw new Error('Không thể lấy dữ liệu số lượng nhân vật');
    } finally {
        if (pool) {
            await pool.close();
        }
    }
};

const getDeletedCreatureCount = async () => {
    let pool = null;
    try {
        pool = await connectBlGame();
        const result = await pool
            .request()
            .query('SELECT COUNT(name) AS DeletedCreatureCount FROM CreatureProperty WHERE deletion = 1');
        return result.recordset[0].DeletedCreatureCount; // Trả về số lượng nhân vật đã bị xóa
    } catch (err) {
        throw new Error('Không thể lấy dữ liệu số lượng nhân vật đã xóa');
    } finally {
        if (pool) {
            await pool.close();
        }
    }
};

module.exports = { getUsers, getCreatureCount, getDeletedCreatureCount };
