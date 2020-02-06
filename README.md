
# @snowplow/react-native-tracker

## Disclaimer

**This project is currently in alpha status.**

Feedback and contributions are welcome - if you have identified a bug, please log an issue on this repo. For all other feedback, discussion or questions please open a thread on our [discourse forum](https://discourse.snowplowanalytics.com/). Be sure to reply to our [feedback thread](https://discourse.snowplowanalytics.com/t/react-feedback-thread/3239) to tell us how it's all working!

Due to pending design decisions, breaking changes in how the methods are called may be introduced before a beta/v1 release.

## Getting started

From the root of your react-js project:

`$ npm install @snowplow/react-native-tracker --save`

### Instrumentation

The tracker will be imported as a NativeModule. Initialise it then call the relevant tracking method:

```
import {NativeModules} from 'react-native';

let RNSnowplowTracker = NativeModules.RNSnowplowTracker;
RNSnowplowTracker.initialize('test-endpoint-url', 'post', 'https', 'namespace', 'app-id', {});
RNSnowplowTracker.trackSelfDescribingEvent({'schema': 'iglu:com.acme/event/jsonschema/1-0-0', 'data': {'message': 'hello world'}}, []);
```

### Running on iOS

`cd ios && pod install && cd ..`

Run the app with: `react-native run-ios` from the root of the project.


### Running on Android

`react-native run-android` from the root of the project.


## Available methods

Note:

Optional string arguments if not set must be specified as `null`.

Optional object arguments must be provided as an empty object if none are set.

Optional keys within an object argument can be omitted if not set.

Optional array arguments must be provided as empty arrays if not set.

### Instantiate the tracker:

`initialize(string endpoint, string method (post or get), string protocol (https or http), string namespace, string appId, JSON options<boolean autoScreenView>)`

**Arguments:**

endpoint - required, collector endpoint string (without protocol)

method - required, http method (`get`/`post`)

protocol - required, http protocol (`http`/`https`)

namespace - required, tracker namespace

appId - required, appId

options - JSON object of optional parameter key value pairs.

Available options:

autoScreenView - boolean, if enabled the tracker will attempt to autotrack screen views via the same method as the native iOS and Android trackers. Note that this feature depends on Activities/ViewDidAppear within the native app itself.

`RNSnowplowTracker.initialize('test-endpoint-url', 'post', 'https', 'namespace', 'app-id', {autoScreenView:false})`


### Track a custom event:

`trackSelfDescribingEvent(JSON event, Array<JSON> contexts)`

**Arguments:**

event - required, Snowplow self-describing JSON for the custom event.

contexts - array of optional Snowplow self-describing JSONs for custom conexts.

**Example**

`RNSnowplowTracker.trackSelfDescribingEvent({'schema': 'iglu:com.acme/event/jsonschema/1-0-0', 'data': {'message': 'hello world'}}, []);`

### Track a structured event:

`trackStructuredEvent(string category, string action, string label, string property, number value, Array<JSON> contexts)`

**Arguments:**

category - required, structured event category.

action - required, structured event action.

label - optional, structured event label.

property - optional, structured event property.

value - optional, structured event value.

contexts - array of optional Snowplow self-describing JSONs for custom conexts.

**Example**

`RNSnowplowTracker.trackStructuredEvent('category', 'action', 'label', 'property', 50.00, [])`

### Track a Screen View (manually):

`trackScreenViewEvent(string screenName, UUID4 string screenId, string screenType, string previousScreenName, string previousScreenType, UUID4 string previousScreenId, string transitionType, Array<JSON> contexts)`

**Arguments:**

screenName - required, name of current screen.

screenId - optional UUID4 string to be used as screen View identifier. Denotes one instance of a screen. view (not one instance of a screen). The react-native tracker will provide a UUID4 if not set.
screenType - optional type of current screen.

previousScreenName - optional, name of previous screen (user must define logic to grab last screen name).

previousScreenType - optional, type of previous screen (user must define logic to grab last screen type).

previousScreenId - optional, screenId of previous screen (user must define logic to grab last screen id). The react-native tracker will leave this value empty if not set.

transitionType - optional, the transition type between the last screen and current.

contexts - array of optional Snowplow self-describing JSONs for custom conexts.


**Example**

`RNSnowplowTracker.trackScreenViewEvent('Name', null, null, null, null, null, null, [])`
