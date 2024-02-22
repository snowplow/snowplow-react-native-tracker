'use strict';

import { NativeModules } from 'react-native';
import { JSSnowplowTracker } from './jsCore';
import type { Native } from './types';
import { errorHandler } from './utils';

const isAvailable = NativeModules.ReactNativeTracker != null;
if (!isAvailable) {
  errorHandler(
    new Error(
      'Unable to access the native iOS/Android Snowplow tracker, a tracker implementation with very limited functionality is used.'
    )
  );
}

const RNSnowplowTracker: Native = isAvailable
  ? (NativeModules.ReactNativeTracker as Native)
  : JSSnowplowTracker;

export { RNSnowplowTracker };
