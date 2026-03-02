/** @type {import('jest').Config} */
const config = {
  projects: [
    // Store tests use node environment (no React Native UI needed)
    {
      displayName: 'stores',
      preset: 'jest-expo/node',
      testMatch: ['**/__tests__/stores/**/*.{ts,tsx,js}'],
      setupFilesAfterEnv: [],
      moduleNameMapper: {
        '^@/(.*)$': '<rootDir>/$1',
      },
      transformIgnorePatterns: [
        'node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|zustand)',
      ],
    },
    // Component tests use full React Native environment
    {
      displayName: 'components',
      preset: 'jest-expo',
      testMatch: ['**/__tests__/components/**/*.{ts,tsx,js}'],
      setupFilesAfterEnv: ['@testing-library/jest-native/extend-expect'],
      moduleNameMapper: {
        '^@/(.*)$': '<rootDir>/$1',
        // Mock expo winter runtime that uses import.meta (not available in jest CJS)
        '^expo/src/winter$': '<rootDir>/__mocks__/expo-winter-index.js',
        '^expo/src/winter/(.*)$': '<rootDir>/__mocks__/expo-winter.js',
      },
      transformIgnorePatterns: [
        'node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@unimodules/.*|unimodules|native-base|react-native-svg)',
      ],
    },
  ],
};

module.exports = config;
