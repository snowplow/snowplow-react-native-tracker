module.exports = {
  root: true,
  extends: '@react-native-community',
  plugins: ['jest', 'detox'],
  overrides: [
    {
      files: ['tests/**'],
      env: {
        'detox/detox': true,
        jest: true,
        'jest/globals': true,
      },
    },
  ],
};
