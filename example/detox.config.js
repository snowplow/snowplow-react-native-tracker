/** @type {Detox.DetoxConfig} */
module.exports = {
  logger: {
    level: process.env.CI ? 'debug' : undefined,
  },
  testRunner: {
    args: {
      config: 'e2e/jest.config.js',
      maxWorkers: process.env.CI ? 2 : undefined,
      _: ['e2e'],
    },
  },
  artifacts: {
    plugins: {
      log: process.env.CI ? 'failing' : undefined,
      screenshot: process.env.CI ? 'failing' : undefined,
    },
  },
  apps: {
    'ios.release': {
      type: 'ios.app',
      binaryPath:
        'ios/build/Build/Products/Release-iphonesimulator/ReactNativeTrackerExample.app',
      build:
        'export RCT_NO_LAUNCH_PACKAGER=true && xcodebuild -workspace ios/ReactNativeTrackerExample.xcworkspace -UseNewBuildSystem=NO -scheme ReactNativeTrackerExample -configuration Release -sdk iphonesimulator -derivedDataPath ios/build -quiet',
    },
    'ios.debug': {
      type: 'ios.app',
      binaryPath:
        'ios/build/Build/Products/Debug-iphonesimulator/ReactNativeTrackerExample.app',
      build:
        'xcodebuild -workspace ios/ReactNativeTrackerExample.xcworkspace -UseNewBuildSystem=NO -scheme ReactNativeTrackerExample -configuration Debug -sdk iphonesimulator -derivedDataPath ios/build',
    },
    'android.debug': {
      type: 'android.apk',
      binaryPath: 'android/app/build/outputs/apk/debug/app-debug.apk',
      build:
        'cd android ; ./gradlew assembleDebug assembleAndroidTest -DtestBuildType=debug ; cd -',
    },
    'android.release': {
      type: 'android.apk',
      binaryPath: 'android/app/build/outputs/apk/release/app-release.apk',
      build:
        'cd android ; ./gradlew assembleRelease assembleAndroidTest -DtestBuildType=release ; cd -',
    },
  },
  devices: {
    'simulator': {
      type: 'ios.simulator',
      headless: Boolean(process.env.CI),
      device: {
        type: 'iPhone 14',
      },
    },
    'emulator': {
      type: 'android.emulator',
      device: {
        avdName: 'Pixel_API_28_AOSP',
      },
    }
  },
  configurations: {
    'ios.sim.release': {
      device: 'simulator',
      app: 'ios.release',
    },
    'ios.sim.debug': {
      device: 'simulator',
      app: 'ios.debug',
    },
    'ios.manual': {
      type: 'ios.manual',
      behavior: {
        launchApp: 'manual',
      },
      artifacts: false,
      session: {
        autoStart: true,
        server: 'ws://localhost:8099',
        sessionId: 'com.wix.demo.react.native',
      },
    },
    'android.emu.debug': {
      device: 'emulator',
      app: 'android.debug',
    },
    'android.emu.release': {
      device: 'emulator',
      app: 'android.release',
    },
  },
};
