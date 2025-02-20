import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import {
  getUserData,
  updateGameAccountExp,
  updateCharacter,
} from "../../../services/api/editCharacterService";
import "./EditCharacter.css";
import { useNavigate } from 'react-router-dom';
import { FaChevronUp, FaChevronDown  } from "react-icons/fa";


const EditCharacter = () => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const userName = queryParams.get("userName");

  const [userData, setUserData] = useState(null);
  const [gameAccountExp, setGameAccountExp] = useState([]);
  const [creatures, setCreatures] = useState([]);
  const [totalAmount, setTotalAmount] = useState(0);
  const [totalBalance, setTotalBalance] = useState(0);
  const [loading, setLoading] = useState(false);
  const [expandedSections, setExpandedSections] = useState({}); // Theo dõi trạng thái đóng/mở từng phần


  const [message, setMessage] = useState('');


  const navigate = useNavigate();



  // Hàm thay đổi trạng thái đóng/mở
  const toggleSection = (sectionId) => {
    setExpandedSections((prev) => ({
      ...prev,
      [sectionId]: !prev[sectionId], // Đảo trạng thái
    }));
  };

  // Fetch data when component mounts
  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getUserData(userName);
        setUserData(data);
        setGameAccountExp(data.gameAccountExp || []);
        setCreatures(data.creatures || []);
        setTotalAmount(data.totalAmount || 0);
        setTotalBalance(data.totalBalance || 0);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    if (userName) {
      fetchData();
    }
  }, [userName]);

  const handleBackClick = () => {
    navigate('/admin-manager#accountManagement');
  };

  const handleGameAccountExpChange = (gameAccountId, field, value) => {
    setGameAccountExp((prev) =>
      prev.map((item) =>
        item.GameAccountID === gameAccountId ? { ...item, [field]: value } : item
      )
    );
  };

  const handleCreatureChange = (pcid, field, value) => {
    setCreatures((prev) =>
      prev.map((item) =>
        item.pcid === pcid ? { ...item, [field]: value } : item
      )
    );
  };

  const handleUpdateGameAccountExpField = async (gameAccountId, accountExp, accountExpQuotaPerDay) => {
    setLoading(true);
    try {
      // Gửi cả hai giá trị trong một lần gọi API
      await updateGameAccountExp(gameAccountId, accountExp, accountExpQuotaPerDay);
      alert("Tài khoản trò chơi đã được cập nhật thành công!");
    } catch (error) {
      console.error("Lỗi khi cập nhật tài khoản trò chơi:", error);
      alert(`Lỗi khi cập nhật: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateCreatureField = async (pcid, field, value) => {
    setLoading(true);
    try {
      await updateCharacter(pcid, field, value, userName);
      alert("Cập nhật nhân vật thành công!");

    } catch (error) {
      alert(`Lỗi khi cập nhật: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const fieldsToExclude = [
    ...Array.from({ length: 92 }, (_, i) => `appearance${i + 1}`),
    "deletion",
    "deletion_time",
    "pcid",
    "survey",
    "achievement_id",
    "achievement_step",
    "ability_achievement_id",
    "ability_achievement_step",
    "guard_gauge",
    "builder_right",
    "duel_point",
    "party_battle_point",
    "field_play_point",
    "life_contents_point",
    "logout_time",
    "heart_count",
    "skill_skin_id",
    "pvp_mode_cooltime",
    "challenge_party_out_time",
    "x",
    "y",
    "z",
    "geo_zone",
  ];

  const labelMapping = {
    game_account_id: "Game Account ID",
    world_id: "World ID",
    race: "Race",
    sex: "Sex",
    job: "Job",
    name: "Character Name",
    yaw: "Yaw",
    level: "Level",
    exp: "EXP",
    faction_reputation: "Faction Reputation",
    mastery_level: "Mastery Level",
    mastery_exp: "Mastery Exp",
    hp: "HP",
    money: "Money",
    money_diff: "Money Diff",
    faction: "Faction",
    faction2: "Faction 2",
    inventory_size: "Inventory Size",
    depository_size: "Depository Size",
    wardrobe_size: "Wardenrobe Size",
    premium_depository_size: "Premium Depository Size",
    acquired_skill_build_up_point: "Acquired Skill Build Up Point",
    account_exp_to_add: "Account Exp To Add",
    account_exp_added: "Account Exp Added",
    account_exp_added_time: "Account Exp Added Time",
    account_exp_by_pc: "Account Exp By PC",
    activated_badge_page: "Activated Badge Page",
    pvp_mode: "Pvp Mode",
    guild_invitation_refusal: "Guild Invitation Refusal",
    slate_page: "Slate Page",
    guild_point: "Guild Point",
  };

  return (
    <div className="edit-character-container">
      <button className="back-button" onClick={handleBackClick}>Quay lại</button>
      <h1>
        Chỉnh sửa Nhân Vật <span className="username-highlight">{userName}</span>
      </h1>
      <h5>Ngày tạo: {userData ? userData.Created : "Loading..."}</h5>

      <div className="deposit-info">
        <table className="table-info">
          <thead>
            <tr>
              <th>Total Amount</th>
              <th>Total Balance</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                <div className="Amount-content">
                  <p>{totalAmount}</p>
                  <img className="Amount-img" src="/kimcuong.jpg" />
                </div>
              </td>
              <td>
                <div className="Amount-content">
                  <p>{totalBalance}</p>
                  <img className="Amount-img" src="/kimcuong.jpg" />
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="accordion">
        {gameAccountExp.map((exp) => (
          <div key={exp.GameAccountID} className="accordion-item">
            <div
              className={`accordion-header ${
                expandedSections[exp.GameAccountID] ? "open" : ""
              }`}
              onClick={() => toggleSection(exp.GameAccountID)}
            >
              Game Account ID: {exp.GameAccountID}
              <button
                className="toggle-button"
                
              >
                {expandedSections[exp.GameAccountID] ? <FaChevronUp  /> : <FaChevronDown   />}
              </button>
            </div>
            
              
            {expandedSections[exp.GameAccountID] && (
              
              <div className="accordion-content">
                <div className="content-GameAccountExp">
                  <div className="form-group">
                    <div className="label-character">
                      <label>Account Experience:</label>
                    </div>
                    <div className="update-character-content">
                      <input
                        type="number"
                        value={exp.AccountExp}
                        onChange={(e) =>
                          handleGameAccountExpChange(exp.GameAccountID, "AccountExp", e.target.value)
                        }
                      />
                    </div>
                  </div>
                  <div className="form-group">
                    <div className="label-character">
                      <label>Daily Experience Quota:</label>
                    </div>
                    <div className="update-character-content">
                      <input
                        type="number"
                        value={exp.AccountExpQuotaPerDay}
                        onChange={(e) =>
                          handleGameAccountExpChange(
                            exp.GameAccountID,
                            "AccountExpQuotaPerDay",
                            e.target.value
                          )
                        }
                      />
                    </div>
                  </div>
                </div>
                <button
                  className="update-button update-button-GameAccountExp"
                  onClick={() =>
                    handleUpdateGameAccountExpField(
                      exp.GameAccountID,
                      exp.AccountExp,
                      exp.AccountExpQuotaPerDay
                    )
                  }
                  disabled={loading}
                >
                  {loading ? "Updating..." : "Update"}
                </button>
              </div>
            )}
          </div>
        ))}
      </div>


        {/* chỉnh sửa nhân vật  */}
      <div className="accordion">
        {creatures.map((creature) => (
          <div key={creature.pcid} className="accordion-item">
             <div
              className={`accordion-header ${
                expandedSections[creature.pcid] ? "open" : ""
              }`}
              onClick={() => toggleSection(creature.pcid)}
            >
              Character ID: {creature.pcid} - {creature.name}
              <button
                className="toggle-button"
              >
                {expandedSections[creature.pcid] ? <FaChevronUp  /> : <FaChevronDown   />}
              </button>
            </div>
            {expandedSections[creature.pcid] && (
            <div className="accordion-content">
              {Object.keys(creature)
                .filter((key) => !fieldsToExclude.includes(key))
                .map((key) => (
                  <div key={key} className="form-group">
                    <div className="label-character">
                      <label>{labelMapping[key] || key}:</label>
                    </div>
                    <div className="update-character-content">
                      <input
                        type="text"
                        value={creature[key]}
                        onChange={(e) =>
                          handleCreatureChange(creature.pcid, key, e.target.value)
                        }
                      />
                      <button
                        className="update-button"
                        onClick={() =>
                          handleUpdateCreatureField(
                            creature.pcid,
                            key,
                            creature[key]
                          )
                        }
                        disabled={loading}
                      >
                        {loading ? "Updating..." : "Update"}
                      </button>
                    </div>
                  </div>
                ))}
            </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default EditCharacter;
