/** @type {import('jest').Config} */
module.exports = {
  maxWorkers: 1,
  globalSetup: "detox/runners/jest/globalSetup",
  globalTeardown: "detox/runners/jest/globalTeardown",
  testEnvironment: "detox/runners/jest/testEnvironment",
  setupFilesAfterEnv: ["./setup.js"],
  testRunner: "jest-circus/runner",
  testTimeout: 300000,
  testRegex: "\\.e2e.detox\\.js$",
  transform: {
    "\\.tsx?$": "ts-jest"
  },
  reporters: ["detox/runners/jest/reporter"],
  verbose: true
};
