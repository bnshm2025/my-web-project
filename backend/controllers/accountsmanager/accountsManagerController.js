const {
    getUsers,
    getCreatureCount,
    getDeletedCreatureCount,
} = require('../../services/accountsmanager/accountManagerService');

const getAllUsers = async (req, res) => {
    try {
        // Lấy dữ liệu từ service
        const users = await getUsers();
        const creatureCount = await getCreatureCount();
        const deletedCreatureCount = await getDeletedCreatureCount();

        // Trả về dữ liệu dưới dạng JSON
        res.json({
            users,
            creatureCount,
            deletedCreatureCount,
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Lỗi máy chủ' });
    }
};

module.exports = { getAllUsers };
