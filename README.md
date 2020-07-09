
# @snowplow/react-native-tracker

[![Early Release]][Tracker Classificiation] [![Release][release-image]][releases] [![License][license-image]][license]

Feedback and contributions are welcome - if you have identified a bug, please log an issue on this repo. For all other feedback, discussion or questions please open a thread on our [discourse forum](https://discourse.snowplowanalytics.com/).

## Getting started

From the root of your react-native project:

`$ npm install @snowplow/react-native-tracker --save`

### Instrumentation

The tracker will be imported as a NativeModule. Initialise it then call the relevant tracking method:

```JavaScript
import Tracker from '@snowplow/react-native-tracker';


Tracker.initialize({
  // required
  endpoint: 'test-endpoint',
  method: 'post',
  protocol: 'https',
  namespace: 'my-namespace',
  appId: 'my-app-id',

  // optional
  setPlatformContext: true,
  setBase64Encoded: true,
  setApplicationContext:true,
  setLifecycleEvents: true,
  setScreenContext: true,
  setSessionContext: true,
  foregroundTimeout: 600,
  backgroundTimeout: 300,
  checkInterval: 15,
  setInstallEvent: true
  });

Tracker.trackSelfDescribingEvent({'schema': 'iglu:com.acme/hello_world_event/jsonschema/1-0-0', 'data': {'message': 'hello world'}});
```

### Running on iOS

`cd ios && pod install && cd ..`

Run the app with: `react-native run-ios` from the root of the project.

### Running on Android

`react-native run-android` from the root of the project.

## Available methods

All methods take a JSON of named arguments.

### Instantiate the tracker:

```JavaScript

initialize({
  // required
  endpoint: 'my-endpoint',
  method: 'post',
  protocol: 'https',
  namespace: 'my-namespace',
  appId: 'my-app-id',

  // optional
  setPlatformContext: true,
  setBase64Encoded: true,
  setApplicationContext:true,
  setLifecycleEvents: true,
  setScreenContext: true,
  setSessionContext: true,
  foregroundTimeout: 600,
  backgroundTimeout: 300,
  checkInterval: 15,
  setInstallEvent: true
  }
);
```

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
  }
);
```


### Track a custom event:

```JavaScript
trackSelfDescribingEvent({ // Self-describing JSON for the custom event
  'schema': 'iglu:com.acme/event/jsonschema/1-0-0',
  'data': {'message': 'hello world'}
});
```

### Track a structured event:

```JavaScript
trackStructuredEvent({
  // required
  category: 'my-category',
  action: 'my-action',
  // optional
  label: 'my-label',
  property: 'my-property',
  value: 50.00
  }
);
```

### Track a Screen View:

Note - for the track Screen View method, if previous screen values aren't set, they should be automatically set by the tracker.

```JavaScript
trackScreenViewEvent({
  screenName: 'my-screen-name', //required
  // optional:
  screenType: 'my-screen-type',
  transitionType: 'my-transition'
  }
);
```

### Track a Page View:

```JavaScript
trackPageViewEvent({
  pageUrl: 'https://www.my-page-url.com', // required
  //optional:
  pageTitle: 'my page title',
  pageReferrer: 'http://www.my-refr.com'
  }
);
```

### Attaching custom contexts

All track methods take an optional second argument - an array of 0 or more self-describing JSONs for custom contexts:

```JavaScript
trackSelfDescribingEvent({ // Self-describing JSON for the custom event
  'schema': 'iglu:com.acme/event/jsonschema/1-0-0',
  'data': {'message': 'hello world'}
  },
  [{schema: "iglu:com.acme/entity/jsonschema/1-0-0", data: {myEntityField: "hello world"}}]
);

trackStructuredEvent({// required
  category: 'my-category',
  action: 'my-action',
  // optional
  label: 'my-label',
  property: 'my-property',
  value: 50.00
  },
  [{schema: "iglu:com.acme/entity/jsonschema/1-0-0", data: {myEntityField: "hello world"}}]
);

trackScreenViewEvent({
  screenName: 'my-screen-name', //required
  // optional:
  screenType: 'my-screen-type',
  transitionType: 'my-transition'
  },
  [{schema: "iglu:com.acme/entity/jsonschema/1-0-0", data: {myEntityField: "hello world"}}]
);

trackPageViewEvent({
  pageUrl: 'https://www.my-page-url.com', //required
  // optional
  pageTitle: 'my page title',
  pageReferrer: 'http://www.my-refr.com'
  },
  [{schema: "iglu:com.acme/entity/jsonschema/1-0-0", data: {myEntityField: "hello world"}}]
);
```

[Tracker Classificiation]: https://github.com/snowplow/snowplow/wiki/Tracker-Maintenance-Classification
[Early Release]: https://img.shields.io/static/v1?style=flat&label=Snowplow&message=Early%20Release&color=014477&labelColor=9ba0aa&logo=data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAMAAAAoLQ9TAAAAeFBMVEVMaXGXANeYANeXANZbAJmXANeUANSQAM+XANeMAMpaAJhZAJeZANiXANaXANaOAM2WANVnAKWXANZ9ALtmAKVaAJmXANZaAJlXAJZdAJxaAJlZAJdbAJlbAJmQAM+UANKZANhhAJ+EAL+BAL9oAKZnAKVjAKF1ALNBd8J1AAAAKHRSTlMAa1hWXyteBTQJIEwRgUh2JjJon21wcBgNfmc+JlOBQjwezWF2l5dXzkW3/wAAAHpJREFUeNokhQOCA1EAxTL85hi7dXv/E5YPCYBq5DeN4pcqV1XbtW/xTVMIMAZE0cBHEaZhBmIQwCFofeprPUHqjmD/+7peztd62dWQRkvrQayXkn01f/gWp2CrxfjY7rcZ5V7DEMDQgmEozFpZqLUYDsNwOqbnMLwPAJEwCopZxKttAAAAAElFTkSuQmCC 

[release-image]: https://img.shields.io/badge/release-0.1.0-orange.svg?style=flat
[releases]: https://github.com/snowplow/snowplow/releases

[license-image]: https://img.shields.io/badge/license-Apache--2-blue.svg?style=flat
[license]: https://www.apache.org/licenses/LICENSE-2.0