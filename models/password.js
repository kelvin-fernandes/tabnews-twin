import bcryptjs from "bcryptjs";
import { UnauthorizedError } from "infra/errors.js";

async function hash(password) {
  const rounds = process.env.NODE_ENV === "production" ? 14 : 1;
  const hashedPassword = await bcryptjs.hash(
    password + getBlackPepper(),
    rounds,
  );
  return hashedPassword;
}

async function compare(password, hash) {
  const isValidPassword = await bcryptjs.compare(
    password + getBlackPepper(),
    hash,
  );

  if (!isValidPassword) {
    throw new UnauthorizedError({
      message: "Invalid email or password",
      action: "Please check your credentials and try again",
    });
  }

  return isValidPassword;
}

function getBlackPepper() {
  const blackPepper = process.env.BLACK_PEPPER;
  if (!blackPepper) {
    throw new Error("BLACK_PEPPER environment variable is not set.");
  }

  return blackPepper;
}

const password = {
  hash,
  compare,
};

export default password;
