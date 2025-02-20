const sql = require('mssql');
const { connectBlGame } = require('../../config/db');

// Hàm ánh xạ cột với kiểu dữ liệu SQL và giá trị hợp lệ
const mapFieldToSqlType = (field, value) => {
  const bitFields = ['deletion', 'pvp_mode', 'guild_invitation_refusal'];
  const datetimeFields = ['deletion_time'];
  const bigintFields = [
    'pcid', 'mastery_exp', 'hp', 'money', 'money_diff', 'logout_time',
    'pvp_mode_cooltime', 'challenge_party_out_time', 'account_exp_added_time',
    'account_exp_by_pc',
  ];
  const uniqueidentifierFields = ['game_account_id'];
  const smallintFields = [
    'world_id', 'race', 'sex', 'job', ...Array.from({ length: 92 }, (_, i) => `appearance${i + 1}`),
    'level', 'mastery_level', 'yaw', 'faction', 'faction2', 'achievement_id', 'achievement_step',
    'inventory_size','depository_size', 'wardrobe_size', 'premium_depository_size', 'heart_count', 'activated_badge_page',
    'slate_page', 'skill_skin_id', 'acquired_skill_build_up_point',
  ];
  const nvarcharFields = ['name'];
  const intFields = ['geo_zone', 'exp', 'faction_reputation', 'duel_point', 'party_battle_point', 'account_exp_to_add', 'account_exp_added', 'guild_point',];
  const tinyintFields = ['slate_page'];
  const varbinaryFields = ['survey'];

  if (bitFields.includes(field)) {
    return { sqlType: sql.Bit, value: Boolean(value) ? 1 : 0 };
  }
  if (datetimeFields.includes(field)) {
    const dateValue = new Date(value);
    if (isNaN(dateValue.getTime())) throw new Error(`Giá trị không hợp lệ cho trường ${field}.`);
    return { sqlType: sql.DateTime, value: dateValue.toISOString() };
  }
  if (bigintFields.includes(field)) {
    const parsedValue = parseInt(value, 10);
    if (isNaN(parsedValue)) throw new Error(`Giá trị không hợp lệ cho trường ${field}.`);
    return { sqlType: sql.BigInt, value: parsedValue };
  }
  if (uniqueidentifierFields.includes(field)) {
    return { sqlType: sql.UniqueIdentifier, value: value.toString() };
  }
  if (smallintFields.includes(field)) {
    const parsedValue = parseInt(value, 10);
    if (isNaN(parsedValue)) throw new Error(`Giá trị không hợp lệ cho trường ${field}.`);
    return { sqlType: sql.SmallInt, value: parsedValue };
  }
  if (nvarcharFields.includes(field)) {
    return { sqlType: sql.NVarChar, value: value.toString() };
  }
  if (intFields.includes(field)) {
    const parsedValue = parseInt(value, 10);
    if (isNaN(parsedValue)) throw new Error(`Giá trị không hợp lệ cho trường ${field}.`);
    return { sqlType: sql.Int, value: parsedValue };
  }
  if (tinyintFields.includes(field)) {
    const parsedValue = parseInt(value, 10);
    if (isNaN(parsedValue) || parsedValue < 0 || parsedValue > 255) {
      throw new Error(`Giá trị không hợp lệ cho trường ${field}.`);
    }
    return { sqlType: sql.TinyInt, value: parsedValue };
  }
  if (varbinaryFields.includes(field)) {
    return { sqlType: sql.VarBinary, value: Buffer.from(value, 'hex') };
  }

  throw new Error(`Field ${field} không được hỗ trợ.`);
};

// Service để xử lý logic cập nhật nhân vật
const updateCharacterService = async (pcid, field, value) => {
  let pool = null;

  try {
    // Ánh xạ kiểu dữ liệu và giá trị
    const { sqlType, value: mappedValue } = mapFieldToSqlType(field, value);

    // Kết nối tới cơ sở dữ liệu
    pool = await connectBlGame();

    // Thực thi câu lệnh SQL
    await pool.request()
      .input('pcid', sql.BigInt, pcid)
      .input('value', sqlType, mappedValue)
      .query(`UPDATE CreatureProperty SET ${field} = @value WHERE pcid = @pcid`);

    return `${field} đã được cập nhật thành công!`;
  } catch (err) {
    throw new Error(err.message || 'Lỗi khi cập nhật nhân vật.');
  } finally {
    if (pool) {
      try {
        await pool.close();
      } catch (err) {
        console.error('Lỗi khi đóng kết nối cơ sở dữ liệu:', err.message);
      }
    }
  }
};

module.exports = { updateCharacterService };
