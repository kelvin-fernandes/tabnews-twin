const nextJest = require("next/jest");

const createJestConfig = nextJest();
const jestConfig = createJestConfig({
  moduleDirectories: ["node_modules", "<rootDir>"],
  globalSetup: "<rootDir>/dotenv-test.js",
});

module.exports = jestConfig;