
# @snowplow/react-native-tracker

## Disclaimer

**This project is currently in alpha status.**

Feedback and contributions are welcome - if you have identified a bug, please log an issue on this repo. For all other feedback, discussion or questions please open a thread on our [discourse forum](https://discourse.snowplowanalytics.com/).

## Getting started

From the root of your react-js project:

`$ npm install @snowplow/react-native-tracker --save`

### Instrumentation

The tracker will be imported as a NativeModule. Initialise it then call the relevant tracking method:

```
import {NativeModules} from 'react-native';

let RNSnowplowTracker = NativeModules.RNSnowplowTracker;
RNSnowplowTracker.initialize('test-endpoint-url', 'post', 'https', 'namespace', 'app-id');
RNSnowplowTracker.trackSelfDescribingEvent({'schema': 'iglu:com.acme/event/jsonschema/1-0-0', 'data': {'message': 'hello world'}}, []);
```

### Running on iOS

For iOS, the tracker's dependencies must be installed as frameworks.

First add `use_frameworks!` to your app's Podfile. Then:

`cd ios && pod install && cd ..`

Run the app with: `react-native run-ios` from the root of the project.


### Running on Android

`react-native run-android` from the root of the project.


## Available methods

`initialize(string endpoint, string method (post or get), string protocol (https or http), string namespace, string appId)`

`trackSelfDescribingEvent(JSON event, Array<JSON> contexts)`
`trackStructuredEvent(string category, string action, string label, string property, number value, Array<JSON> contexts)`
