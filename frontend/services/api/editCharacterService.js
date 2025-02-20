import api from './api';

// Hàm lấy thông tin người dùng
export const getUserData = async (userName) => {
  try {
    console.log('Fetching user data for:', userName); // Debug
    const response = await api.get(`/edit-charhongmoon?userName=${encodeURIComponent(userName)}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching user data:', error?.response?.data || error.message);
    throw error?.response?.data || error;
  }
};

// Hàm cập nhật thông tin GameAccountExp
export const updateGameAccountExp = async (gameAccountId, accountExp, accountExpQuotaPerDay) => {
  if (!gameAccountId) {
    throw new Error('GameAccountID is required');
  }
  try {
    const payload = {
      gameAccountId,
      ...(accountExp !== null && { accountExp: Number(accountExp) }),
      ...(accountExpQuotaPerDay !== null && { accountExpQuotaPerDay: Number(accountExpQuotaPerDay) }),
    };
    console.log('Updating Game Account Exp:', payload); // Debug payload
    const response = await api.post(`/update-game-account-exp`, payload);
    return response.data;
  } catch (error) {
    console.error('Error updating GameAccountExp:', error?.response?.data || error.message);
    throw error?.response?.data || error;
  }
};

// Hàm cập nhật thông tin của nhân vật
export const updateCharacter = async (pcid, field, value, userName) => {
  try {
    const response = await api.post('/update-character', {
      pcid,
      field,
      value,
      userName,
    });
    return response.data;
  } catch (error) {
    console.error('Error updating character:', error.response?.data || error.message);
    throw error.response?.data || error;
  }
};

// API cập nhật thông tin nạp tiền
export const updateDeposit = async (deposit_id, amount, balance, userName) => {
  try {
    const response = await api.post('/update-deposit', {
      deposit_id,
      amount,
      balance,
      userName,
    });
    return response.data;
  } catch (error) {
    console.error('Error updating deposit:', error.response?.data || error.message);
    throw error.response?.data || error;
  }
};
