const { connectBNSWebDb, sql } = require('../../config/db');

class StoreManagementRepository {
    // Thêm mới một sản phẩm vào bảng Stores
    async createStore(store) {
        const pool = await connectBNSWebDb ();
        await pool
            .request()
            .input('ItemName', sql.NVarChar, store.itemName)
            .input('ItemId', sql.Int, store.itemId)
            .input('Date', sql.DateTime, store.date)
            .input('ItemDescription', sql.NVarChar, store.itemDescription)
            .input('ItemType', sql.NVarChar, store.itemType)
            .input('ItemDiscount', sql.Decimal(5, 2), store.itemDiscount)
            .input('ItemPrice', sql.Decimal(10, 2), store.itemPrice)
            .input('ItemImage', sql.VarBinary(sql.MAX), store.itemImage)
            .input('EmbeddedImages', sql.NText, JSON.stringify(store.embeddedImages))

            .query(`
                INSERT INTO Stores (ItemId, ItemName, Date, ItemDescription, ItemType, ItemDiscount, ItemPrice, ItemImage, EmbeddedImages) 
                VALUES (@ItemId, @ItemName, @Date, @ItemDescription, @ItemType, @ItemDiscount, @ItemPrice, @ItemImage, @EmbeddedImages)
            `);
    }

    // Lấy danh sách tất cả sản phẩm trong bảng Stores
    async getStores() {
        const pool = await connectBNSWebDb();
        const result = await pool.request().query('SELECT * FROM Stores');
        return result.recordset;
    }

    // Xóa sản phẩm dựa trên ItemId
    async deleteStore(itemId) {
        const pool = await connectBNSWebDb();
        await pool
            .request()
            .input('ItemId', sql.Int, itemId)
            .query('DELETE FROM Stores WHERE ItemId = @ItemId');
    }
    

    // Cập nhật thông tin sản phẩm dựa trên ItemId
    async updateStore(storeId, storeData) {
        const pool = await connectBNSWebDb();
        const request = pool
            .request()
            .input('StoreId', sql.Int, storeId)  // Dùng storeId làm tham số
            .input('ItemId', sql.Int, storeData.itemId)
            .input('Date', sql.DateTime, storeData.date)
            .input('ItemName', sql.NVarChar, storeData.itemName)
            .input('ItemDescription', sql.NVarChar, storeData.itemDescription)
            .input('ItemType', sql.NVarChar, storeData.itemType)
            .input('ItemDiscount', sql.Decimal(5, 2), storeData.itemDiscount)
            .input('ItemPrice', sql.Decimal(10, 2), storeData.itemPrice);
    
        // Thêm itemImage nếu có
        if (storeData.itemImage) {
            request.input('ItemImage', sql.VarBinary, storeData.itemImage);
        }
    
        try {
            const query = `
                UPDATE Stores
                SET 
                    ItemId = @ItemId,
                    ItemName = @ItemName,
                    Date = @Date,
                    ItemDescription = @ItemDescription,
                    ItemType = @ItemType,
                    ItemDiscount = @ItemDiscount,
                    ItemPrice = @ItemPrice
                    ${storeData.itemImage ? ', ItemImage = @ItemImage' : ''}
                WHERE Id = @StoreId
            `;
            await request.query(query);
        } catch (error) {
            console.error('Error updating store:', error);
            throw error;
        }
    }
    

    // Lấy thông tin sản phẩm dựa trên ItemId
    async getStoreById(storeId) {
        const pool = await connectBNSWebDb();
        const result = await pool
            .request()
            .input('StoreId', sql.Int, storeId)
            .query('SELECT * FROM Stores WHERE Id = @StoreId');
        return result.recordset[0];
    }

    // Tìm kiếm sản phẩm dựa trên từ khóa
    async searchStores(keyword) {
        try {
            const pool = await connectBNSWebDb();
            const result = await pool.request()
                .input('Keyword', sql.NVarChar, `%${keyword}%`)
                .query(`
                    SELECT * 
                    FROM Stores
                    WHERE 
                        ItemName LIKE @Keyword OR
                        ItemDescription LIKE @Keyword OR
                        Tags LIKE @Keyword
                `);
            return result.recordset;
        } catch (error) {
            console.error('Error in searchstores repository:', error);
            throw error;
        }
    }
}

module.exports = new StoreManagementRepository();
