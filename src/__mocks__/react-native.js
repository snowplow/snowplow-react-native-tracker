module.exports = {
  NativeModules: {
    RNSnowplowTracker: {
      createTracker: (n, cc) => Promise.resolve(true),
    },
  },
};
