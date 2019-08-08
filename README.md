
# @snowplow/react-native-tracker

# Disclaimer

**This project is under development in the proof-of-concept stage. It is not yet supported nor recommended for use in production.**

## Getting started

`$ npm install @snowplow/react-native-tracker --save`

### Mostly automatic installation

`$ react-native link @snowplow/react-native-tracker`

### Manual installation


#### iOS

1. In XCode, in the project navigator, right click `Libraries` ➜ `Add Files to [your project's name]`
2. Go to `node_modules` ➜ `@snowplow/react-native-tracker` and add `RNSnowplowTracker.xcodeproj`
3. In XCode, in the project navigator, select your project. Add `libRNSnowplowTracker.a` to your project's `Build Phases` ➜ `Link Binary With Libraries`
4. Run your project (`Cmd+R`)<

#### Android

1. Open up `android/app/src/main/java/[...]/MainActivity.java`
  - Add `import com.snowplowanalytics.react.tracker.RNSnowplowTrackerPackage;` to the imports at the top of the file
  - Add `new RNSnowplowTrackerPackage()` to the list returned by the `getPackages()` method
2. Append the following lines to `android/settings.gradle`:
  	```
    include ':@snowplow_react-native-tracker'
    project(':@snowplow_react-native-tracker').projectDir = new File(rootProject.projectDir, '../node_modules/@snowplow/react-native-tracker/android')
  	```
3. Insert the following lines inside the dependencies block in `android/app/build.gradle`:
  	```
      compile project(':@snowplow_react-native-tracker')
  	```

## Usage
```javascript
import {NativeModules} from 'react-native';

let RNSnowplowTracker = NativeModules.RNSnowplowTracker;
RNSnowplowTracker.initialize('test-endpoint-url', 'post', 'https', 'namespace', 'app-id');
RNSnowplowTracker.trackSelfDescribingEvent({'schema': 'iglu:com.acme/event/jsonschema/1-0-0', 'data': {'message': 'hello world'}}, []);
```

## Available methods

`initialize(string endpoint, string method (post or get), string protocol (https or http), string namespace, string appId)`

`trackSelfDescribingEvent(JSON event, Array<JSON> contexts)`
