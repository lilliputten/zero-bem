// @see:
// - https://jestjs.io/docs/en/webpack.html
// - https://github.com/facebook/jest/issues/3094
module.exports = {
  testURL: 'http://localhost',
  testPathIgnorePatterns: ['node_modules'],
  moduleFileExtensions: ['js'],
  transform: {
    '^.+\\.js$': 'babel-jest',
    // '^.+\\.(ts|tsx)$' : 'ts-jest',
    '.+\\.(css|pcss|styl|less|sass|scss)$': 'jest-transform-css',
    '.+\\.(bemhtml)$': '<rootDir>/bemhtml-loader/jest-transform-zero-bemhtml.js',
  },
  testMatch: [
    '**/*.test.+(js)',
  ],
  moduleNameMapper: {
    // '\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$': '<rootDir>/__mocks__/fileMock.js',
    '\\.(pcss|css|less|svg)$': '<rootDir>/__mocks__/style.js',
  },
  // testEnvironment: '<rootDir>/__mocks__/customizedJsdomEnv.js',
  setupFiles: [ '<rootDir>/__mocks__/setup.js', ],
  modulePaths: [
    '<rootDir>/src',
  ],
  globals: {
    'babel-jest': {
      babelrcFile: 'babel-jest.config.js',
    },
  },
};
