/*
 * Copyright (c) 2020-2022 Snowplow Analytics Ltd. All rights reserved.
 *
 * This program is licensed to you under the Apache License Version 2.0,
 * and you may not use this file except in compliance with the Apache License Version 2.0.
 * You may obtain a copy of the Apache License Version 2.0 at http://www.apache.org/licenses/LICENSE-2.0.
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the Apache License Version 2.0 is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the Apache License Version 2.0 for the specific language governing permissions and limitations there under.
 */

'use strict';

import { NativeModules } from 'react-native';
import { JSSnowplowTracker } from './jsCore';
import type { Native } from './types';
import { errorHandler } from './utils';

const isAvailable = NativeModules.RNSnowplowTracker != null;
if (!isAvailable) {
  errorHandler(
    new Error(
      'Unable to access the native iOS/Android Snowplow tracker, a tracker implementation with very limited functionality is used.'
    )
  );
}

const RNSnowplowTracker: Native = isAvailable ? NativeModules.RNSnowplowTracker as Native : JSSnowplowTracker;

export {
  RNSnowplowTracker
};
