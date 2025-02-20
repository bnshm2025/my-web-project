const { updateCharacterService } = require('../../services/accountsmanager/updateCharacterService');

// Controller để xử lý yêu cầu cập nhật nhân vật
const updateCharacterController = async (req, res) => {
  const { pcid, field, value, userName } = req.body;

  // Kiểm tra thông số đầu vào
  if (!pcid || !field || value === undefined || !userName) {
    return res.status(400).send('Thiếu thông số cần thiết hoặc giá trị không hợp lệ.');
  }

  try {
    // Gọi service để xử lý logic cập nhật
    const result = await updateCharacterService(pcid, field, value);
    res.send(result);
  } catch (err) {
    console.error('Lỗi khi cập nhật nhân vật:', err);
    res.status(500).send('Lỗi máy chủ.');
  }
};

module.exports = { updateCharacterController };
