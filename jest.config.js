module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    roots: ['<rootDir>/src'],
    transform: {
      "^.+\\.tsx?$": ["ts-jest", { isolatedModules: true }]
    },
    testRegex: '(/__tests__/.*|(\\.|/)(test|spec))\\.tsx?$',
    moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
    moduleDirectories: ['node_modules', 'src'],
    globals: {
      'ts-jest': {
        tsconfig: 'tsconfig.json'
      }
    }
  };