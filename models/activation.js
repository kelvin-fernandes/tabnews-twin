import email from "infra/email.js";
import database from "infra/database.js";
import webserver from "infra/webserver.js";

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

async function findOneByUserId(userId) {
  const activationToken = await runSelectQuery(userId);
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

async function runSelectQuery(userId) {
  const results = await database.query({
    text: `SELECT
            *
          FROM
            user_activation_tokens
          WHERE
            user_id = $1
          LIMIT
            1
          ;`,
    values: [userId],
  });

  return results.rows[0];
}

const activation = {
  sendEmailToUser,
  findOneByUserId,
  create,
};

export default activation;
