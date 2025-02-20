const storeRepository = require('../../repositories/storeManagement/storeManagementRepository');
const Stores = require('../../models/store/storeModel');

class StoreManagementService {
    // Thêm mới một sản phẩm
    async addNewStore( itemId, itemName, date, itemDescription, itemType, itemDiscount, itemPrice, itemImage, embeddedImages) {
        const store = new Stores(
            itemId,
            itemName,
            date,
            itemDescription,
            itemType,
            itemDiscount,
            itemPrice,
            itemImage,
            embeddedImages
        );
        await storeRepository.createStore(store);
    }

    // Lấy danh sách tất cả sản phẩm
    async getAllStores() {
        return await storeRepository.getStores();
    }

    // Xóa sản phẩm dựa trên ID
    async deleteStoreById(storeId) {
        await storeRepository.deleteStore(storeId);
    }

    // Cập nhật thông tin sản phẩm
    async updateStoreById(storeId, storeData) {
        await storeRepository.updateStore(storeId, storeData);
    }

    // Lấy thông tin sản phẩm theo ID
    async getStoreById(storeId) {
        return await storeRepository.getStoreById(storeId);
    }
}

module.exports = new StoreManagementService();
