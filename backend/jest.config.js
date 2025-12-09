/* eslint-disable no-undef */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  // Only run tests from src/ directory, ignore dist/
  testPathIgnorePatterns: ['/node_modules/', '/dist/'],
  // Only match test files in src/
  testMatch: ['**/src/**/*.spec.ts'],
};
