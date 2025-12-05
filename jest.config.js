const nextJest = require("next/jest");

const createJestConfig = nextJest();
const jestConfig = createJestConfig({
  moduleDirectories: ["node_modules", "<rootDir>"],
  globalSetup: "<rootDir>/dotenv-test.js",
  testTimeout: 30000,
});

module.exports = jestConfig;