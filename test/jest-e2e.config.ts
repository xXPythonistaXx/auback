import type { Config } from '@jest/types';
import { pathsToModuleNameMapper } from 'ts-jest';

const config: Config.InitialOptions = {
  testEnvironment: 'node',
  rootDir: '../',
  roots: ['<rootDir>/src', '<rootDir>/test'],
  testRegex: '.*\\.e2e-spec\\.(t|j)s$',
  transform: {
    '^.+\\.(t|j)s$': 'ts-jest',
  },
  moduleNameMapper: {
    '^axios$': require.resolve('axios'),
    ...pathsToModuleNameMapper({
      '@libs/*': ['<rootDir>/src/libs/*'],
      '@modules/*': ['<rootDir>/src/modules/*'],
      '@shared/*': ['<rootDir>/src/shared/*'],
      '@config/*': ['<rootDir>/src/config/*'],
      '@schemas': ['<rootDir>/src/schemas'],
    }),
  },
  verbose: true,
};

export default config;
