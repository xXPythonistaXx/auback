import type { Config } from '@jest/types';
import { pathsToModuleNameMapper } from 'ts-jest';

const config: Config.InitialOptions = {
  testEnvironment: 'node',
  preset: 'ts-jest',
  rootDir: './',
  roots: ['<rootDir>/src', '<rootDir>/test'],
  testRegex: '.*\\.spec\\.(t|j)s$',
  transform: {
    '^.+\\.(t|j)s$': 'ts-jest',
  },
  collectCoverageFrom: [
    '<rootDir>/src/**/*.(t|j)s',
    '!<rootDir>/src/main.ts',
    '!<rootDir>/src/*.options.ts',
    '!<rootDir>/src/**/*.factory.ts',
    '!<rootDir>/src/**/index.ts',
    '!<rootDir>/src/**/*.config.ts',
    '!<rootDir>/src/**/*.entity.ts',
    '!<rootDir>/src/**/*.module.ts',
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['lcov', 'text'],
  moduleNameMapper: {
    '^axios$': require.resolve('axios'),
    ...pathsToModuleNameMapper({
      '@libs/*': ['<rootDir>/src/libs/*'],
      '@modules/*': ['<rootDir>/src/modules/*'],
      '@shared/*': ['<rootDir>/src/shared/*'],
      '@config/*': ['<rootDir>/src/config/*'],
      '@schemas': ['<rootDir>/src/schemas'],
      '@test': ['<rootDir>/src/test/*'],
    }),
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  modulePaths: ['<rootDir>'],
  verbose: true,
};

export default config;
