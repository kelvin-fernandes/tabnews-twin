import user from "models/user.js";
import password from "models/password.js";
import { NotFoundError, UnauthorizedError } from "infra/errors.js";

async function validateCredentials(credentials) {
  try {
    const userFromDatabase = await user.findOneByEmail(credentials.email);
    await password.compare(credentials.password, userFromDatabase.password);
    return userFromDatabase;
  } catch (error) {
    if (error instanceof NotFoundError || error instanceof UnauthorizedError) {
      throw new UnauthorizedError({
        message: "Invalid email or password",
        action: "Please check your credentials and try again",
      });
    }

    throw error;
  }
}

const authentication = {
  validateCredentials,
};

export default authentication;
