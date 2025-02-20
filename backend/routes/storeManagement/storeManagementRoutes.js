const express = require('express');
const router = express.Router();
const storeManagementController = require('../../controllers/storeManagement/storeManagementController');

// Middleware xử lý file upload
const multer = require('multer');
const upload = multer();

// Routes
// Tạo sản phẩm mới
router.post('/storeManagement', upload.single('itemImage'), (req, res) => storeManagementController.createStore(req, res));

// Lấy danh sách tất cả sản phẩm
router.get('/storeManagement', (req, res) => storeManagementController.getStores(req, res));

// Lấy chi tiết sản phẩm theo ID
router.get('/storeManagement/:id', (req, res) => storeManagementController.getStoreById(req, res));

// Xóa sản phẩm theo ID
router.delete('/storeManagement/:id', (req, res) => storeManagementController.deleteStore(req, res));

// Cập nhật sản phẩm theo ID
router.put('/storeManagement/:id', upload.single('itemImage'), (req, res) => storeManagementController.updateStore(req, res));

// Tìm kiếm sản phẩm
router.get('/storeManagement/search', (req, res) => storeManagementController.searchStores(req, res));

module.exports = router;
