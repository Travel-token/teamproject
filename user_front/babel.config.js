module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    // react-native-reanimated 플러그인은 반드시 plugins 배열의 마지막에 있어야 합니다.
    plugins: ['react-native-reanimated/plugin'],
  };
};
