import crypto from "crypto";
import database from "infra/database.js";

const EXPIRATION_IN_MILISECONDS = 60 * 60 * 24 * 30 * 1000; // 30 days

async function create(user) {
  const token = crypto.randomBytes(48).toString("hex");
  const expires_at = new Date(Date.now() + EXPIRATION_IN_MILISECONDS);
  const newSession = await runInsertQuery(token, user.id, expires_at);
  return newSession;
}

async function runInsertQuery(token, userId, expiresAt) {
  const result = await database.query({
    text: `
      INSERT INTO 
        sessions(token, user_id, expires_at) 
      VALUES 
        ($1, $2, $3) 
      RETURNING 
        *`,
    values: [token, userId, expiresAt],
  });
  return result.rows[0];
}

const session = {
  create,
  EXPIRATION_IN_MILISECONDS,
};

export default session;
