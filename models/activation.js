import email from "infra/email.js";
import database from "infra/database.js";
import webserver from "infra/webserver.js";
import user from "models/user.js";

const EXPIRATION_IN_MILISECONDS = 60 * 15 * 1000; // 15 minutes

async function sendEmailToUser(user, activationToken) {
  await email.send({
    from: "Deploya <kelvin@deploya.dev.br>",
    to: user.email,
    subject: "Activate your account at Deploya",
    text: `${user.username},

Please activate your account by clicking the link below:

${webserver.getOrigin()}/register/activate?token=${activationToken.id}

Thank you!
The Deploya Team`,
  });
}

async function findOneByToken(token) {
  const activationToken = await runSelectQuery(token);
  return activationToken;
}

async function create(userId) {
  const expiresAt = getExpirationDate();
  const newActivationToken = await runInsertQuery({ userId, expiresAt });
  return newActivationToken;
}

function getExpirationDate() {
  return new Date(Date.now() + EXPIRATION_IN_MILISECONDS);
}

async function use(activationToken) {
  const usedActivationToken = await runUpdateQuery(activationToken);
  return usedActivationToken;
}

async function activateUserByUserId(userId) {
  const userWithNewFeatures = await user.setFeatures(userId, [
    "create:session",
  ]);
  return userWithNewFeatures;
}

async function runInsertQuery(userInputData) {
  const results = await database.query({
    text: `INSERT INTO 
            user_activation_tokens (user_id, expires_at) 
          VALUES 
            ($1, $2)
          RETURNING
            *
          ;`,
    values: [userInputData.userId, userInputData.expiresAt],
  });

  return results.rows[0];
}

async function runSelectQuery(token) {
  const results = await database.query({
    text: `SELECT
            *
          FROM
            user_activation_tokens
          WHERE
            id = $1
            AND
            used_at IS NULL
            AND
            expires_at > NOW()
          LIMIT
            1
          ;`,
    values: [token],
  });

  return results.rows[0];
}

async function runUpdateQuery(activationToken) {
  const results = await database.query({
    text: `UPDATE
            user_activation_tokens
          SET
            used_at = timezone('UTC', NOW()),
            updated_at = timezone('UTC', NOW())
          WHERE
            id = $1
          RETURNING
            *
          ;`,
    values: [activationToken.id],
  });

  return results.rows[0];
}

const activation = {
  sendEmailToUser,
  findOneByToken,
  create,
  use,
  activateUserByUserId,
};

export default activation;
