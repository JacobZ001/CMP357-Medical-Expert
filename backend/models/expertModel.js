const db = require("../config/db");

async function getExpertById(expertId) {
  const sql = `
        SELECT
            u.user_id,
            u.first_name,
            u.last_name,
            u.email,
            e.expert_id,
            e.specialty,
            e.qualifications,
            e.bio
        FROM users u
        JOIN experts e
            ON u.user_id = e.user_id
        WHERE e.expert_id = ?
    `;

  const [rows] = await db.query(sql, [expertId]);

  return rows[0];
}

module.exports = {
  getExpertById,
};
