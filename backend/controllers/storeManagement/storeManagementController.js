const storeService = require('../../services/storeManagement/storeManagementService.js');
const sharp = require('sharp');

// Hàm chuyển đổi hình ảnh sang định dạng WebP
async function convertToWebP(imageBuffer) {
    return await sharp(imageBuffer).resize({ width: 800 }).webp({ quality: 80 }).toBuffer();
}

class StoreManagementController {
    // Thêm mới sản phẩm
    async createStore(req, res) {
        try {
            const { itemId, itemName, date, itemDescription, itemType, itemDiscount, itemPrice } = req.body;
            let webpImage = null;
            if (req.file) {
                webpImage = await convertToWebP(req.file.buffer);
            }

            const embeddedImages = Object.keys(req.body)
                .filter((key) => key.startsWith('embeddedImage'))
                .map((key) => req.body[key]);
            
            await storeService.addNewStore(itemId, itemName, date, itemDescription, itemType, itemDiscount, itemPrice, webpImage, embeddedImages);
            res.status(201).json({ message: 'Bài viết đã được lưu' });
        } catch (error) {
            // res.status(500).json({ error: 'Đã xảy ra lỗi khi lưu bài viết' });
            console.error('Error in createStore:', error.message); // Thêm log lỗi
            res.status(500).json({ error: error.message });
        }
    }

    // Lấy danh sách sản phẩm
    async getStores(req, res) {
        try {
            const stores = await storeService.getAllStores();
            res.status(200).json(stores);
        } catch (error) {
            res.status(500).json({ error: 'Đã xảy ra lỗi khi lấy danh sách sản phẩm' });
            console.error(error);
        }
    }

    // Xóa sản phẩm
    async deleteStore(req, res) {
        try {
            const storeId = req.params.id;
            await storeService.deleteStoreById(storeId);
            res.status(200).json({ message: 'Sản phẩm đã được xóa thành công' });
        } catch (error) {
            res.status(500).json({ error: 'Đã xảy ra lỗi khi xóa sản phẩm' });
            console.error(error);
        }
    }

    // Cập nhật sản phẩm
    async updateStore(req, res) {
        try {
            const storeId = req.params.id;
            const { itemId, itemName, date, itemDescription, itemType, itemDiscount, itemPrice } = req.body;
            const itemImage = req.file ? req.file.buffer : null;

            await storeService.updateStoreById(storeId, {
                itemId,
                itemName,
                date,
                itemDescription,
                itemType,
                itemDiscount,
                itemPrice,
                itemImage,
            });

            res.status(200).json({ message: 'Sản phẩm đã được cập nhật thành công' });
        } catch (error) {
            res.status(500).json({ error: 'Đã xảy ra lỗi khi cập nhật sản phẩm' });
            console.error(error);
        }
    }

    // Lấy chi tiết sản phẩm theo ID
    async getStoreById(req, res) {
        try {
            const storeId = req.params.id;
            const store = await storeService.getStoreById(storeId);
            if (store) {
                res.status(200).json(store);
            } else {
                res.status(404).json({ error: 'Sản phẩm không tồn tại' });
            }
        } catch (error) {
            res.status(500).json({ error: 'Đã xảy ra lỗi khi lấy chi tiết sản phẩm' });
            console.error(error);
        }
    }
}

module.exports = new StoreManagementController();
