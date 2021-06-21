/*
 * Copyright (c) 2020-2021 Snowplow Analytics Ltd. All rights reserved.
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

import * as api from './api';
import { safeWait, errorHandler } from './utils';

import type { TrackerConfig, ReactNativeTracker } from './types';

/*
 * Creates a React Native Tracker object
 *
 * @param namespace - The tracker namespace
 * @param config - The configuration to be used for the tracker
 * @returns The tracker object
 */
function createTracker(
  namespace: string,
  config: TrackerConfig
): ReactNativeTracker {
  // initTrackerPromise
  const initTrackerPromise: Promise<void> = Promise.resolve(
    api.initializeTracker({
      ...config,
      namespace,
    })
  );

  // mkMethod creates methods subscribed to the initTrackerPromise
  const mkMethod = safeWait(initTrackerPromise, errorHandler);

  // tracker methods
  const setSubjectData = mkMethod(api.setSubjectData);
  const trackScreenViewEvent = mkMethod(api.trackScreenViewEvent);
  const trackSelfDescribingEvent = mkMethod(api.trackSelfDescribingEvent);
  const trackStructuredEvent = mkMethod(api.trackStructuredEvent);
  const trackPageViewEvent = mkMethod(api.trackPageViewEvent);

  return Object.freeze({
    setSubjectData,
    trackScreenViewEvent,
    trackSelfDescribingEvent,
    trackStructuredEvent,
    trackPageViewEvent,
  });
}

export { createTracker };
export type {
  ReactNativeTracker,
  TrackerConfig,
  HttpMethod,
  HttpProtocol,
  SubjectData,
  ScreenViewProps,
  SelfDescribingProps,
  StructuredProps,
  PageViewProps,
  EventContext
} from './types';
