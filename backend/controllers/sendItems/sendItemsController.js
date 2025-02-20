const { connectGameWarehouseDb } = require('../../config/db');
const {
    getOwnerAccId,
    getOwneraccPCID,
    getOwneraccWID,
    getNextGoodsId,
    updateWHState,
    GOODID_CONTAINER,
} = require('../../services/sendItems/sendItemsService');
const sql = require('mssql');

// Hàm chính xử lý gửi item
async function sendItem(data) {
    const { charname, itemID, itemCount } = data;

    if (!charname) throw new Error('Player name is empty');
    if (!itemID || !itemCount) throw new Error('Invalid input parameters');

    const ownerAccId = await getOwnerAccId(charname);
    if (!ownerAccId) throw new Error('User does not exist');

    const ownerPCID = await getOwneraccPCID(charname);
    const ownerWID = await getOwneraccWID(charname);

    if (ownerPCID === null || ownerWID === null) throw new Error('Invalid user data');

    const goodsID = await getNextGoodsId();
    if (goodsID === -1) throw new Error('Error generating GoodsID');

    let pool;
    try {
        pool = await connectGameWarehouseDb();

        // Gọi stored procedure "usp_TryWarehouseRegistration"
        const spRequest = pool.request();

        spRequest.output('NewLabelID', sql.BigInt);
        spRequest.input('OwnerAccountID', sql.UniqueIdentifier, ownerAccId);
        spRequest.input('OwnerPCID', sql.BigInt, ownerPCID);
        spRequest.input('OwnerWID', sql.Int, ownerWID);
        spRequest.input('FirstRequestFromCode', sql.SmallInt, 1);
        spRequest.input('GoodsID', sql.BigInt, goodsID);
        spRequest.input('GoodsNumber', sql.Int, GOODID_CONTAINER);
        spRequest.input('SenderDescription', sql.NVarChar(128), null);
        spRequest.input('SenderMessage', sql.NVarChar(128), null);
        spRequest.input('PurchaseTime', sql.DateTime, new Date());
        spRequest.input('GoodsItemNumber_1', sql.Int, itemID);
        spRequest.input('ItemDataID_1', sql.Int, itemID);
        spRequest.input('ItemAmount_1', sql.Int, itemCount);
        spRequest.input('UsableDuration_1', sql.VarChar, null);

        const result = await spRequest.execute('usp_TryWarehouseRegistration');

        const newLabelID = result.output.NewLabelID;

        if (!newLabelID) throw new Error('Stored procedure failed to return NewLabelID');

        // Gọi updateWHState để cập nhật trạng thái
        const updateResult = await updateWHState(newLabelID);

        return { message: 'Item sent successfully', newLabelID, updateResult };
    } finally {
        if (pool) await pool.close();
    }
}

module.exports = { sendItem };
