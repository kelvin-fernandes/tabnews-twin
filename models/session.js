import crypto from "crypto";
import database from "infra/database.js";
import { UnauthorizedError } from "infra/errors.js";

const EXPIRATION_IN_MILISECONDS = 60 * 60 * 24 * 30 * 1000; // 30 days
const YEAR_IN_MILISECONDS = 365 * 24 * 60 * 60 * 1000;

async function create(userId) {
  const token = crypto.randomBytes(48).toString("hex");
  const expiresAt = getExpirationDate();
  const newSession = await runInsertQuery(token, userId, expiresAt);
  return newSession;
}

async function findValidSessionToken(token) {
  const session = await runSelectQuery(token);
  return session;
}

async function renew(sessionId) {
  const expiresAt = getExpirationDate();
  const renewedSession = await runUpdateQuery(sessionId, expiresAt);
  return renewedSession;
}

async function invalidate(sessionId) {
  const expiresAt = new Date(Date.now() - session.YEAR_IN_MILISECONDS); // 1 year ago
  await runUpdateQuery(sessionId, expiresAt);
}

function getExpirationDate() {
  return new Date(Date.now() + EXPIRATION_IN_MILISECONDS);
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

async function runSelectQuery(token) {
  const result = await database.query({
    text: `
      SELECT
        *
      FROM
        sessions
      WHERE
        token = $1
        AND expires_at > NOW()
      LIMIT
        1`,
    values: [token],
  });

  if (result.rowCount === 0) {
    throw new UnauthorizedError({
      message: "Invalid session token",
      action: "Check if the session token is correct.",
    });
  }

  return result.rows[0];
}

async function runUpdateQuery(sessionId, expiresAt) {
  const result = await database.query({
    text: `
      UPDATE 
        sessions 
      SET 
        expires_at = $2,
        updated_at = NOW()
      WHERE 
        id = $1
      RETURNING 
        *
    ;`,
    values: [sessionId, expiresAt],
  });

  return result.rows[0];
}

const session = {
  create,
  findValidSessionToken,
  renew,
  invalidate,
  EXPIRATION_IN_MILISECONDS,
  YEAR_IN_MILISECONDS,
};

export default session;
