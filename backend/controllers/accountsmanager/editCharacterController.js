const {
    getUserData,
    getGameAccountExp,
    getCreaturesData,
    getDepositsData,
    updateGameAccountExp
} = require('../../services/accountsmanager/editCharacterService');

const getEditCharacterPage = async (req, res) => {
    const { userName } = req.query;

    if (!userName) {
        return res.status(400).send('Missing userName value');
    }

    // Lấy dữ liệu người dùng từ service
    const { user, error: userError } = await getUserData(userName);
    if (userError) return res.status(404).send(userError);

    // Lấy dữ liệu GameAccountExp từ service
    const { gameAccountExp, error: gameExpError } = await getGameAccountExp(user.UserId);
    if (gameExpError) return res.status(500).send(gameExpError);

    // Lấy dữ liệu creatures từ service
    const { creatures, error: creaturesError } = await getCreaturesData(user.UserId);
    if (creaturesError) return res.status(500).send(creaturesError);

    // Lấy dữ liệu deposits từ service
    const { deposits, totalBalance, totalAmount, error: depositsError } = await getDepositsData(user.UserId);
    if (depositsError) return res.status(500).send(depositsError);

    // Render trang
    res.json({
        UserName: user.UserName,
        LoginName: user.LoginName,
        Created: user.Created,
        gameAccountExp: gameAccountExp,
        creatures: creatures,
        deposits: deposits,
        totalBalance: totalBalance,
        totalAmount: totalAmount,
    });
};

const updateGameAccountExpHandler = async (req, res) => {
    const { gameAccountId, accountExp, accountExpQuotaPerDay } = req.body;
  
    // Kiểm tra dữ liệu đầu vào
    if (!gameAccountId || accountExp === undefined || accountExpQuotaPerDay === undefined) {
      console.error('Thiếu dữ liệu cần thiết:', req.body);
      return res.status(400).json({
        error: 'Thiếu dữ liệu cần thiết',
        missingFields: {
          gameAccountId: !gameAccountId ? 'Bắt buộc' : 'Hợp lệ',
          accountExp: accountExp === undefined ? 'Bắt buộc' : 'Hợp lệ',
          accountExpQuotaPerDay: accountExpQuotaPerDay === undefined ? 'Bắt buộc' : 'Hợp lệ',
        },
      });
    }
  
    try {
      // Gọi service để cập nhật dữ liệu
      const rowsAffected = await updateGameAccountExp(gameAccountId, accountExp, accountExpQuotaPerDay);
  
      if (rowsAffected === 0) {
        console.warn('Không tìm thấy tài khoản để cập nhật:', gameAccountId);
        return res.status(404).json({ error: 'Không tìm thấy tài khoản để cập nhật.' });
      }
  
      console.log(`Đã cập nhật GameAccountExp cho tài khoản: ${gameAccountId}`);
      res.json({ message: 'Cập nhật thành công.' });
    } catch (err) {
      console.error('Lỗi khi xử lý yêu cầu cập nhật GameAccountExp:', err.message);
      res.status(500).json({ error: 'Lỗi máy chủ. Vui lòng thử lại sau.' });
    }
  };

module.exports = {
    getEditCharacterPage,
    updateGameAccountExpHandler
};
