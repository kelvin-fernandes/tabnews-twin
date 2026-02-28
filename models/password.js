import bcryptjs from "bcryptjs";

async function hash(password) {
  const rounds = process.env.NODE_ENV === "production" ? 14 : 1;
  const hashedPassword = await bcryptjs.hash((password + getBlackPepper()), rounds);
  console.debug("Hashed password:", hashedPassword);
  return hashedPassword;
}

async function compare(password, hash) {
  const isValidPassword = await bcryptjs.compare((password + getBlackPepper()), hash);
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
