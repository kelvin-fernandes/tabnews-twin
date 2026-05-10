import database from "infra/database.js";
import password from "models/password.js";
import { ValidationError, NotFoundError } from "infra/errors.js";

async function create(userInputData) {
  await validateUniqueUsername(userInputData.username);
  await validateUniqueEmail(userInputData.email);
  await hashPasswordInObject(userInputData);
  const newUserResult = await runInsertQuery(userInputData);

  return newUserResult.rows[0];
}

async function findOneByUsername(username) {
  const userResult = await runSelectQueryWithUsername(username);

  return userResult;
}

async function findOneByEmail(email) {
  const userResult = await runSelectQueryWithEmail(email);

  return userResult;
}

async function findOneById(Id) {
  const userResult = await runSelectQueryWithId(Id);

  return userResult;
}

async function update(username, userInputValues) {
  const currentUser = await runSelectQueryWithUsername(username);

  if ("username" in userInputValues) {
    await validateUniqueUsername(userInputValues.username);
  }

  if ("email" in userInputValues) {
    await validateUniqueEmail(userInputValues.email);
  }

  if ("password" in userInputValues) {
    await hashPasswordInObject(userInputValues);
  }

  const userWithNewValues = {
    ...currentUser,
    ...userInputValues,
  };

  const userUpdateResult = await runUpdateQuery(userWithNewValues);

  return userUpdateResult;
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
    });
  }
}

async function hashPasswordInObject(userInputData) {
  userInputData.password = await password.hash(userInputData.password);
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

async function runSelectQueryWithUsername(username) {
  const userSelectResult = await database.query({
    text: `SELECT
            *
          FROM
            users
          WHERE
            LOWER(username) = LOWER($1)
          LIMIT
            1
          ;`,
    values: [username],
  });

  if (userSelectResult.rowCount === 0) {
    throw new NotFoundError({
      message: "User not found",
      action: "Check if the username is correct.",
    });
  }

  return userSelectResult.rows[0];
}

async function runSelectQueryWithEmail(email) {
  const userSelectResult = await database.query({
    text: `SELECT
            *
          FROM
            users
          WHERE
            LOWER(email) = LOWER($1)
          LIMIT
            1
          ;`,
    values: [email],
  });

  if (userSelectResult.rowCount === 0) {
    throw new NotFoundError({
      message: "User not found",
      action: "Check if the email is correct.",
    });
  }

  return userSelectResult.rows[0];
}

async function runSelectQueryWithId(id) {
  const userSelectResult = await database.query({
    text: `SELECT
            *
          FROM
            users
          WHERE
            id = $1
          LIMIT
            1
          ;`,
    values: [id],
  });

  if (userSelectResult.rowCount === 0) {
    throw new NotFoundError({
      message: "User not found",
      action: "Check if the Id is correct.",
    });
  }

  return userSelectResult.rows[0];
}

async function runUpdateQuery(userWithNewValues) {
  const userUpdateResult = await database.query({
    text: `UPDATE
            users
          SET
            username = $1,
            email = $2,
            password = $3,
            updated_at = timezone('utc', now())
          WHERE
            id = $4
          RETURNING
            *
          ;`,
    values: [
      userWithNewValues.username,
      userWithNewValues.email,
      userWithNewValues.password,
      userWithNewValues.id,
    ],
  });

  if (userUpdateResult.rowCount === 0) {
    throw new NotFoundError({
      message: "User not found",
      action: "Check if the username is correct.",
    });
  }

  return userUpdateResult.rows[0];
}

const user = {
  create,
  findOneByUsername,
  findOneByEmail,
  findOneById,
  update,
};

export default user;
