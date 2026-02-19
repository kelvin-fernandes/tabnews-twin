import database from "infra/database.js";
import { ValidationError } from "infra/errors.js";

async function create(userInputData) {
  await validateUniqueEmail(userInputData.email);
  await validateUniqueUsername(userInputData.username);
  const newUserResult = await runInsertQuery(userInputData);

  return newUserResult.rows[0];
}

async function validateUniqueEmail(email) {
  const emailValidationResult = await database.query({
    text: `SELECT 
            email 
          FROM 
            users 
          WHERE 
            LOWER(email) = LOWER($1)
          ;`,
    values: [email],
  });

  if (emailValidationResult.rowCount > 0) {
    throw new ValidationError({
      message: "Email already exists",
      action: "Use a different email address.",
    });
  }
}

async function validateUniqueUsername(username) {
  const usernameValidationResult = await database.query({
    text: `SELECT 
            username 
          FROM 
            users 
          WHERE 
            LOWER(username) = LOWER($1)
          ;`,
    values: [username],
  });

  if (usernameValidationResult.rowCount > 0) {
    throw new ValidationError({
      message: "Username already exists",
      action: "Use a different username.",
    })
  }
}

async function runInsertQuery(userInputData) {
  const userResult = await database.query({
    text: `INSERT INTO 
            users (username, email, password) 
          VALUES 
            ($1, $2, $3)
          RETURNING
            *
          ;`,
    values: [
      userInputData.username,
      userInputData.email,
      userInputData.password,
    ],
  });

  return userResult;
}

const user = {
  create,
};

export default user;