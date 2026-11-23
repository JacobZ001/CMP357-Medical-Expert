const db = require("../config/db");

async function createUser(firstName, lastName, email, passwordHash, role) {
  const sql = `
        INSERT INTO users
        (first_name, last_name, email, password_hash, role)
        VALUES (?, ?, ?, ?, ?)
    `;

  const [result] = await db.query(sql, [
    firstName,
    lastName,
    email,
    passwordHash,
    role,
  ]);

  return result.insertId;
}

async function createExpert(
  firstName,
  lastName,
  email,
  passwordHash,
  specialty,
  qualifications,
  bio,
) {
  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();

    const userSql = `
            INSERT INTO users
            (first_name, last_name, email, password_hash, role)
            VALUES (?, ?, ?, ?, 'expert')
        `;

    const [userResult] = await connection.query(userSql, [
      firstName,
      lastName,
      email,
      passwordHash,
    ]);

    const userId = userResult.insertId;

    const expertSql = `
            INSERT INTO experts
            (user_id, specialty, qualifications, bio)
            VALUES (?, ?, ?, ?)
        `;

    await connection.query(expertSql, [userId, specialty, qualifications, bio]);

    await connection.commit();

    return userId;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

async function findUserByEmail(email) {
  const sql = `
        SELECT * FROM users
        WHERE email = ?
    `;

  const [rows] = await db.query(sql, [email]);

  return rows[0];
}

module.exports = {
  createUser,
  createExpert,
  findUserByEmail,
};
