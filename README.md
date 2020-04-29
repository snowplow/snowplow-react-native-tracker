
# @snowplow/react-native-tracker

## Disclaimer

**This project is currently in alpha status.**

Feedback and contributions are welcome - if you have identified a bug, please log an issue on this repo. For all other feedback, discussion or questions please open a thread on our [discourse forum](https://discourse.snowplowanalytics.com/).

Due to pending design decisions, breaking changes in how the methods are called may be introduced before a beta/v1 release.

## Getting started

From the root of your react-js project:

`$ npm install @snowplow/react-native-tracker --save`

### Instrumentation

The tracker will be imported as a NativeModule. Initialise it then call the relevant tracking method:

```JavaScript
import Tracker from '@snowplow/react-native-tracker';

Tracker.initialize('test-endpoint', 'post', 'https', 'namespace', 'my-app-id', {
  setPlatformContext: true,
  setBase64Encoded: true,
  setApplicationContext:true,
  setLifecycleEvents: true,
  setScreenContext: true,
  setSessionContext: true,
  foregroundTimeout: 600, // 10 minutes
  backgroundTimeout: 300, // 5 minutes
  checkInterval: 15,
  setInstallEvent: true
  });

Tracker.trackSelfDescribingEvent({'schema': 'iglu:com.acme/hello_world_event/jsonschema/1-0-0', 'data': {'message': 'hello world'}}, []);
```

### Running on iOS

`cd ios && pod install && cd ..`

Run the app with: `react-native run-ios` from the root of the project.


### Running on Android

`react-native run-android` from the root of the project.

## Available methods

### Instantiate the tracker:

```JavaScript
initialize('endpoint', // required, collector endpoint, string
            'method', // required, http method, string enum ('get' or 'post')
            'protocol', // required, http protocol, string enum ('http' or 'https')
            'namespace', // required, tracker namespace, string
            'my-app-id', // required, app id, string
            {
              // optional arguments passed as json. Defaults are values provided
              autoScreenView: false,
              setPlatformContext: false,
              setBase64Encoded: false,
              setApplicationContext: false,
              setLifecycleEvents: false,
              setScreenContext: false,
              setSessionContext: false,
              foregroundTimeout: 600, // 10 minutes
              backgroundTimeout: 300, // 5 minutes
              checkInterval: 15,
              setInstallEvent: false
            });
````

### Set the subject data:

Setting custom subject data is optional, can be called any time, and can be called again to update the subject. Once set, the specified parameters are set for all subsequent events. (For example, a userid may be set after login, and once set all subsequent events will contain the userid).

```JavaScript
setSubjectData({ // All parameters optional
  userId: 'my-userId', // user id, string
  screenWidth: 123, // screen width, integer
  screenHeight: 456, // screen height, integer
  colorDepth: 20, // colour depth, integer
  timezone: 'Europe/London', // timezone, string enum
  language: 'en', // language, string enum
  ipAddress: '123.45.67.89', // IP address, string
  useragent: '[some-user-agent-string]', // user agent, string
  networkUserId: '5d79770b-015b-4af8-8c91-b2ed6faf4b1e', // network user id, UUID4 string
  domainUserId: '5d79770b-015b-4af8-8c91-b2ed6faf4b1e',// domain user id, UUID4 string
  viewportWidth: 123, // viewport width, integer
  viewportHeight: 456 // viewport height, integer
});
```


### Track a custom event:

```JavaScript
trackSelfDescribingEvent({ // Self-describing JSON for the custom event
  'schema': 'iglu:com.acme/event/jsonschema/1-0-0',
  'data': {'message': 'hello world'}
  },
  []); // array of self-describing JSONs for custom contexts, or an empty array if none are to be attached
```

### Track a structured event:

```JavaScript
trackStructuredEvent('my-category', // required, category, string
                    'my-action', // required, action, string
                    'my-label', // optional - set to null if not needed, label, string
                    'my-property', // optional - set to null if not needed, property, string
                    50.00, // optional - set to null if not needed, value, number
                    []); // array of self-describing JSONs for custom contexts, or an empty array if none are to be attached
```

### Track a Screen View:

Note - for the track Screen View method, if previous screen values aren't set, they should be automatically set by the tracker.

```JavaScript
trackScreenViewEvent('my-screen-name', // required, screen name, string
                    '63ddebea-a948-4e0c-b458-96467d46f230', // optional - set to null if not needed (recommended), screen id, /uuid4 string
                    'my-screen-type' // optional - set to null if not needed (recommended), screen type, string
                    'my-previous-screen', // optional - set to null if not needed (recommended), previous screen name, string
                    'my-previous-screen-type', // optional - set to null if not needed (recommended), previous screen type, string
                    'e4711a72-c721-4dfa-b51a-a2e201dcec09', // optional - set to null if not needed (recommended), previous screen id, UUID4 string
                    'my-transition-type', // optional - set to null if not needed (recommended), transition type, string
                    []); // array of self-describing JSONs for custom contexts, or an empty array if none are to be attached
```

### Track a Page View:

```JavaScript
trackPageViewEvent('my-page-url.com', // required, page url, string
                  'my page title', // optional - set to null if not needed, page title, string
                  'my-page-referrer.com', // optional - set to null if not needed, referrer url, string
                  []); // array of self-describing JSONs for custom contexts, or an empty array if none are to be attached
```
