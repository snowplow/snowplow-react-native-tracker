/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
module.exports = {
  NativeModules: {
    RNSnowplowTracker: {
      createTracker: (n,cc) => Promise.resolve(true)
    }
  }
};
