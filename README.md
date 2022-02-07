
# @snowplow/react-native-tracker

[![actively-maintained]][tracker-classification]
[![Build Status][gh-actions-image]][gh-actions]
[![License][license-image]][license]

[![Release][release-image]][releases]
[![RN version][react-native-v-image]][react-native-v]
[![downloads][downloads-dm-image]][downloads-dm]


Snowplow is a scalable open-source platform for rich, high quality, low-latency data collection. It is designed to collect high quality, complete behavioral data for enterprise business.

**To find out more, please check out the [Snowplow website][website] and our [documentation][docs].**


## Snowplow React-Native Tracker Overview

The Snowplow React Native Tracker allows you to add analytics to your React Native apps when using a [Snowplow][snowplow] pipeline.

With this library you can collect granular event-level data as your users interact with your React Native applications. It is build on top of Snowplow's [Mobile Native][native-trackers] [iOS][objc-tracker] and [Android][android-tracker] Trackers, in order to support the full range of out-of-the-box Snowplow events and tracking capabilities.


## Quick start

From the root of your [React Native][react-native] project:

```
npm install --save @snowplow/react-native-tracker
npx pod-install
```

Then, instrument the tracker in your app and start tracking events. For example:

```javascript
import { createTracker } from '@snowplow/react-native-tracker';

const tracker = createTracker(
    'my-namespace',
    { endpoint: 'https://my-collector.endpoint' }
);

tracker.trackScreenViewEvent({ name: 'myScreenName' });
```

The Snowplow React Native Tracker also provides first-class support for TypeScript, as it is fully typed.

See also our [DemoApp][demoapp] for an example implementation.


## Find out more

| Technical Docs                    | Setup Guide                 |
|-----------------------------------|-----------------------------|
| [![i1][techdocs-image]][techdocs] | [![i2][setup-image]][setup] |
| [Technical Docs][techdocs]        | [Setup Guide][setup]        |



## Maintainer quick start

### Launching the DemoApp

Assuming a [react-native environment][react-native-environment] is set up, from the root of the repository:

```bash
npm install
npm run bootstrap
cd DemoApp
```

**For Android:**

```bash
yarn android
```
_Note_: Linux users who want to run the DemoApp for Android, would also need to run `yarn start` in a separate terminal.

**For iOS:**

```bash
yarn pods && yarn ios
```

During development, to quickly test changes, the `.scripts/quickTest.sh` bash script can be used.

```bash
# android
bash .scripts/quickTest.sh android
# ios
bash .scripts/quickTest.sh ios
# both
bash .scripts/quickTest.sh both
```

Similarly, the `.scripts/cleanBuildAndRun.sh` script offers a naive way to clean-rebuild the entire project with your changes.

```bash
# android
bash .scripts/cleanBuildAndRun.sh android
# ios
bash .scripts/cleanBuildAndRun.sh ios
# both
bash .scripts/cleanBuildAndRun.sh both
```


### End-to-end tests

Snowplow React-Native Tracker is being end-to-end tested using [Snowplow Micro][snowplow-micro] and [Detox][detox]. To run these tests locally:

#### Prerequisites

1. **Docker**: Used to launch Snowplow Micro and expose its collector endpoint on `http://0.0.0.0:9090`.
2. **Perl**: Used to substitute the endpoint placeholders in `DemoApp/App.js` with Micro's endpoint for respective emulator/simulator.
3. **Detox** platform-specific development environment setup:
    - [For Android][detox-android-env]. Namely:
      - Java 8
      - Android SDK
      - Android Open-Source Project emulator
    - [For iOS][detox-ios-env]. Namely:
      - applesimutils

#### Testing

Once the prerequisites are in place:

```
npm install
npm run bootstrap
cd DemoApp
```

 - **e2e-android**
```
yarn e2e:android:micro
```

 - **e2e-ios**
```
yarn e2e:ios:micro
```

The above commands will take care to kill Micro's running container before exiting. If you'd prefer to keep Micro running in order to inspect the tracked events through Micro's REST API, you can alternatively control Micro through:

```
yarn micro:run
yarn micro:stop
```
and run the e2e-tests on their own:
```
yarn e2e:android
# or
yarn e2e:ios
```


## Contributing

Feedback and contributions are welcome - if you have identified a bug, please log an issue on this repo. For all other feedback, discussion or questions please open a thread on our [discourse forum][discourse].

| Contributing                              |
|-------------------------------------------|
| [![i3][contributing-image]][contributing] |
| [Contributing][contributing]              |



## Copyright and license

The Snowplow React Native Tracker is copyright 2020-2022 Snowplow Analytics Ltd, 2019 DataCamp.

Licensed under the **[Apache License, Version 2.0][license]** (the "License");
you may not use this software except in compliance with the License.

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.


[tracker-classification]: https://docs.snowplowanalytics.com/docs/collecting-data/collecting-from-own-applications/tracker-maintenance-classification/
[actively-maintained]: https://img.shields.io/static/v1?style=flat&label=Snowplow&message=Actively%20Maintained&color=6638b8&labelColor=9ba0aa&logo=data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAMAAAAoLQ9TAAAAeFBMVEVMaXGXANeYANeXANZbAJmXANeUANSQAM+XANeMAMpaAJhZAJeZANiXANaXANaOAM2WANVnAKWXANZ9ALtmAKVaAJmXANZaAJlXAJZdAJxaAJlZAJdbAJlbAJmQAM+UANKZANhhAJ+EAL+BAL9oAKZnAKVjAKF1ALNBd8J1AAAAKHRSTlMAa1hWXyteBTQJIEwRgUh2JjJon21wcBgNfmc+JlOBQjwezWF2l5dXzkW3/wAAAHpJREFUeNokhQOCA1EAxTL85hi7dXv/E5YPCYBq5DeN4pcqV1XbtW/xTVMIMAZE0cBHEaZhBmIQwCFofeprPUHqjmD/+7peztd62dWQRkvrQayXkn01f/gWp2CrxfjY7rcZ5V7DEMDQgmEozFpZqLUYDsNwOqbnMLwPAJEwCopZxKttAAAAAElFTkSuQmCC
[gh-actions]: https://github.com/snowplow-incubator/snowplow-react-native-tracker/actions
[gh-actions-image]: https://github.com/snowplow-incubator/snowplow-react-native-tracker/workflows/build/badge.svg?branch=master

[license]: https://www.apache.org/licenses/LICENSE-2.0
[license-image]: https://img.shields.io/badge/license-Apache--2-blue.svg?style=flat

[releases]: https://www.npmjs.com/package/@snowplow/react-native-tracker
[release-image]: https://img.shields.io/npm/v/@snowplow/react-native-tracker

[react-native-v]: https://www.npmjs.com/package/@snowplow/react-native-tracker
[react-native-v-image]: https://img.shields.io/npm/dependency-version/@snowplow/react-native-tracker/peer/react-native

[downloads-dm]: https://www.npmjs.com/package/@snowplow/react-native-tracker
[downloads-dm-image]: https://img.shields.io/npm/dm/@snowplow/react-native-tracker

[website]: https://snowplowanalytics.com
[docs]: https://docs.snowplowanalytics.com
[snowplow]: https://github.com/snowplow/snowplow
[discourse]: https://discourse.snowplowanalytics.com

[techdocs]: https://docs.snowplowanalytics.com/docs/collecting-data/collecting-from-own-applications/react-native-tracker/introduction
[techdocs-image]: https://d3i6fms1cm1j0i.cloudfront.net/github/images/techdocs.png
[setup]: https://docs.snowplowanalytics.com/docs/collecting-data/collecting-from-own-applications/react-native-tracker/quick-start-guide/
[setup-image]: https://d3i6fms1cm1j0i.cloudfront.net/github/images/setup.png

[contributing]: https://github.com/snowplow-incubator/snowplow-react-native-tracker/blob/master/CONTRIBUTING.md
[contributing-image]: https://d3i6fms1cm1j0i.cloudfront.net/github/images/contributing.png

[react-native]: https://reactnative.dev/
[react-native-environment]: https://reactnative.dev/docs/environment-setup
[snowplow-micro]: https://github.com/snowplow-incubator/snowplow-micro
[snowplow-mini]: https://github.com/snowplow/snowplow-mini

[native-trackers]: https://docs.snowplowanalytics.com/docs/collecting-data/collecting-from-own-applications/mobile-trackers/mobile-trackers-v2-0
[objc-tracker]: https://github.com/snowplow/snowplow-objc-tracker
[android-tracker]: https://github.com/snowplow/snowplow-android-tracker

[demoapp]: https://github.com/snowplow-incubator/snowplow-react-native-tracker/tree/master/DemoApp
[gh-actions-workflows]: https://github.com/snowplow-incubator/snowplow-react-native-tracker/tree/master/.github/workflows
[detox]: https://github.com/wix/Detox
[detox-android-env]: https://github.com/wix/Detox/blob/master/docs/Introduction.AndroidDevEnv.md
[detox-ios-env]: https://github.com/wix/Detox/blob/master/docs/Introduction.iOSDevEnv.md
