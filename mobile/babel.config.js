module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    // react-native-worklets/plugin Reanimated 4 için gereklidir ve EN SONDA olmalı.
    plugins: ['react-native-worklets/plugin'],
  };
};
