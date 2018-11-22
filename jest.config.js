module.exports = {
  preset: 'ts-jest',
  testURL: 'http://localhost',
  testEnvironment: 'node',
  testPathIgnorePatterns: ['<rootDir>/.next/', '<rootDir>/node_modules/'],
  moduleDirectories: ['src', 'node_modules'],
  roots: ['test/'],
  moduleNameMapper: {
    '\\.(css)$': 'identity-obj-proxy'
  }
}
