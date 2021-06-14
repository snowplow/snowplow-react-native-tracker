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

import { NativeModules } from 'react-native';

const { RNSnowplowTracker } = NativeModules;

/*
 * Initialize a tracker from specified argmap.
 *
 * @param argmap - The configuration to use for the tracker instance
 * @returns - A promise fullfilled if the tracker is initialized
 */
function initializeTracker(argmap) {

  const defaults = {// defaults for optional params
    method: 'post',
    protocol: 'https',
    base64Encoded : true,
    platformContext : true,
    applicationContext : false,
    lifecycleEvents : false,
    screenContext : true,
    sessionContext : true,
    foregroundTimeout : 600,
    backgroundTimeout : 300,
    checkInterval : 15,
    installTracking : false};

  const ok = typeof argmap.endpoint !== 'undefined' && typeof argmap.appId !== 'undefined' && typeof argmap.namespace !== 'undefined';

  if (ok) {
    // RNSnowplowTracker.initialize is a Promise
    return RNSnowplowTracker.initialize({...defaults, ...argmap});
  } else {
    const initReason = 'SnowplowTracker: initialize() requires endpoint, namespace and appId parameter to be set';
    return Promise.reject(new Error(initReason));
  }
}


/*
 * Sets data for the Subject
 *
 * @param argmap - The subject data to be used
 * @returns - A promise that is fullfilled if the Subject data is set
 */
function setSubjectData(argmap) {
  return Promise.resolve(RNSnowplowTracker.setSubjectData(argmap));
}

/*
 * Tracks a ScreenView event
 *
 * @param argmap - The ScreenView event's parameters
 * @param ctxt - An array of contexts to be attached to the event
 * @returns - A promise that is fullfilled if the event is tracked successfully
 */
function trackScreenViewEvent(argmap, ctxt = []) {
  if (typeof argmap.screenName !== 'undefined') {
    return Promise.resolve(RNSnowplowTracker.trackScreenViewEvent(argmap, ctxt));
  } else {
    const reason = 'SnowplowTracker: trackScreenViewEvent() requires screenName parameter to be set';
    return Promise.reject(new Error(reason));
  }
}

/*
 * Tracks a SelfDescribing event
 *
 * @param argmap - The SelfDescribing event's parameters
 * @param ctxt - An array of contexts to be attached to the event
 * @returns - A promise that is fullfilled if the event is tracked successfully
 */
function trackSelfDescribingEvent(argmap, ctxt = []) {
  if (typeof argmap.schema !== 'undefined' && typeof argmap.data !== 'undefined') {
    return Promise.resolve(RNSnowplowTracker.trackSelfDescribingEvent(argmap, ctxt));
  } else {
    const reason = 'SnowplowTracker: trackSelfDescribingEvent() requires schema and data parameters to be set';
    return Promise.reject(new Error(reason));
  }
}

/*
 * Tracks a Structured event
 *
 * @param argmap - The Structured event's parameters
 * @param ctxt - An array of contexts to be attached to the event
 * @returns - A promise that is fullfilled if the event is tracked successfully
 */
function trackStructuredEvent(argmap, ctxt = []) {
  if (typeof argmap.category !== 'undefined' && typeof argmap.action !== 'undefined') {
    return Promise.resolve(RNSnowplowTracker.trackStructuredEvent(argmap, ctxt));
  } else {
    const reason = 'SnowplowTracker: trackStructuredEvent() requires category and action parameters to be set';
    return Promise.reject(new Error(reason));
  }
}

/*
 * Tracks a PageView event
 *
 * @param argmap - The PageView event's parameters
 * @param ctxt - An array of contexts to be attached to the event
 * @returns - A promise that is fullfilled if the event is tracked successfully
 */
function trackPageViewEvent(argmap, ctxt = []) {
  if (typeof argmap.pageUrl !== 'undefined') {
    return Promise.resolve(RNSnowplowTracker.trackPageViewEvent(argmap, ctxt));
  } else {
    const reason = 'SnowplowTracker: trackPageViewEvent() requires pageUrl parameter to be set';
    return Promise.reject(new Error(reason));
  }
}

export {
  initializeTracker,
  setSubjectData,
  trackScreenViewEvent,
  trackSelfDescribingEvent,
  trackStructuredEvent,
  trackPageViewEvent,
};
