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

import { RNSnowplowTracker } from './native';
import { initValidate, isValidGC } from './configurations';
import { logMessages } from './constants';
import * as tracker from './tracker';
import * as subject from './subject';

import type {
  InitTrackerConfiguration,
  SubjectConfiguration,
  SelfDescribing,
  EventContext,
  ScreenViewProps,
  StructuredProps,
  PageViewProps,
  TimingProps,
  ConsentGrantedProps,
  ConsentWithdrawnProps,
  EcommerceTransactionProps,
  GlobalContext,
  ScreenSize,
  DeepLinkReceivedProps,
  MessageNotificationProps,
} from './types';

/**
 * Create a tracker from specified initial configuration.
 *
 * @param initConfig {Object} - The initial tracker configuration
 * @returns - A promise fullfilled if the tracker is initialized
 */
function createTracker(initConfig: InitTrackerConfiguration): Promise<void> {
  return <Promise<void>>initValidate(initConfig)
    .then(() => <Promise<void>>RNSnowplowTracker.createTracker(initConfig))
    .catch((error) => {
      throw new Error(`${logMessages.createTracker} ${error.message}.`);
    });
}

/**
 * Removes the tracker with given namespace
 *
 * @param trackerNamespace {string} - The tracker namespace
 * @returns - A boolean promise
 */
function removeTracker(trackerNamespace: string): Promise<boolean> {
  if (typeof trackerNamespace !== 'string') {
    return Promise.reject(new Error(logMessages.removeTracker));
  }
  return <Promise<boolean>>Promise.resolve(RNSnowplowTracker.removeTracker({tracker:trackerNamespace}));
}

/**
 * Removes all existing trackers
 *
 * @returns - A void promise
 */
function removeAllTrackers(): Promise<boolean> {
  return <Promise<boolean>>Promise.resolve(RNSnowplowTracker.removeAllTrackers());
}

/**
 * Returns a function to track a SelfDescribing event by a tracker
 *
 * @param namespace {string} - The tracker namespace
 * @returns - A function to track a SelfDescribing event
 */
function trackSelfDescribingEvent(namespace: string) {
  return function (
    argmap: SelfDescribing,
    contexts: EventContext[] = []
  ): Promise<void> {
    return tracker.trackSelfDescribingEvent(namespace, argmap, contexts);
  };
}

/**
 * Returns a function to track a ScreenView event by a tracker
 *
 * @param namespace {string} - The tracker namespace
 * @returns - A function to track a ScreenView event
 */
function trackScreenViewEvent(namespace: string) {
  return function (
    argmap: ScreenViewProps,
    contexts: EventContext[] = []
  ): Promise<void> {
    return tracker.trackScreenViewEvent(namespace, argmap, contexts);
  };
}

/**
 * Returns a function to track a Structured event by a tracker
 *
 * @param namespace {string} - The tracker namespace
 * @returns - A function to track a Structured event
 */
function trackStructuredEvent(namespace: string) {
  return function (
    argmap: StructuredProps,
    contexts: EventContext[] = []
  ): Promise<void> {
    return tracker.trackStructuredEvent(namespace, argmap, contexts);
  };
}

/**
 * Returns a function to track a PageView event by a tracker
 *
 * @param namespace {string} - The tracker namespace
 * @returns - A function to track a PageView event
 */
function trackPageViewEvent(namespace: string) {
  return function (
    argmap: PageViewProps,
    contexts: EventContext[] = []
  ): Promise<void> {
    return tracker.trackPageViewEvent(namespace, argmap, contexts);
  };
}

/**
 * Returns a function to track a Timing event by a tracker
 *
 * @param namespace {string} - The tracker namespace
 * @returns - A function to track a Timing event
 */
function trackTimingEvent(namespace: string) {
  return function (
    argmap: TimingProps,
    contexts: EventContext[] = []
  ): Promise<void> {
    return tracker.trackTimingEvent(namespace, argmap, contexts);
  };
}

/**
 * Returns a function to track a ConsentGranted event by a tracker
 *
 * @param namespace {string} - The tracker namespace
 * @returns - A function to track a ConsentGranted event
 */
function trackConsentGrantedEvent(namespace: string) {
  return function (
    argmap: ConsentGrantedProps,
    contexts: EventContext[] = []
  ): Promise<void> {
    return tracker.trackConsentGrantedEvent(namespace, argmap, contexts);
  };
}

/**
 * Returns a function to track a ConsentWithdrawn event by a tracker
 *
 * @param namespace {string} - The tracker namespace
 * @returns - A function to track a ConsentWithdrawn event
 */
function trackConsentWithdrawnEvent(namespace: string) {
  return function (
    argmap: ConsentWithdrawnProps,
    contexts: EventContext[] = []
  ): Promise<void> {
    return tracker.trackConsentWithdrawnEvent(namespace, argmap, contexts);
  };
}

/**
 * Returns a function to track an EcommerceTransaction event by a tracker
 *
 * @param namespace {string} - The tracker namespace
 * @returns - A function to track an EcommerceTransaction event
 */
function trackEcommerceTransactionEvent(namespace: string) {
  return function (
    argmap: EcommerceTransactionProps,
    contexts: EventContext[] = []
  ): Promise<void> {
    return tracker.trackEcommerceTransactionEvent(namespace, argmap, contexts);
  };
}

/**
 * Returns a function to track an DeepLinkReceived event by a tracker
 *
 * @param namespace {string} - The tracker namespace
 * @returns - A function to track an DeepLinkReceived event
 */
function trackDeepLinkReceivedEvent(namespace: string) {
  return function (
    argmap: DeepLinkReceivedProps,
    contexts: EventContext[] = []
  ): Promise<void> {
    return tracker.trackDeepLinkReceivedEvent(namespace, argmap, contexts);
  };
}

/**
 * Returns a function to track an MessageNotification event by a tracker
 *
 * @param namespace {string} - The tracker namespace
 * @returns - A function to track an MessageNotification event
 */
function trackMessageNotificationEvent(namespace: string) {
  return function (
    argmap: MessageNotificationProps,
    contexts: EventContext[] = []
  ): Promise<void> {
    return tracker.trackMessageNotificationEvent(namespace, argmap, contexts);
  };
}

/**
 * Returns a function to remove global contexts by a tracker
 *
 * @param namespace {string} - The tracker namespace
 * @returns - A function to remove global contexts
 */
function removeGlobalContexts(namespace:string) {
  return function (tag: string): Promise<void> {
    if (typeof tag !== 'string') {
      return Promise.reject(new Error(`${logMessages.removeGlobalContexts} ${logMessages.gcTagType}`));
    }
    return <Promise<void>>Promise.resolve(RNSnowplowTracker.removeGlobalContexts({tracker:namespace, removeTag: tag}));
  };
}

/**
 * Returns a function to add global contexts by a tracker
 *
 * @param namespace {string} - The tracker namespace
 * @returns - A function to add global contexts
 */
function addGlobalContexts(namespace:string) {
  return function (gc: GlobalContext): Promise<void> {
    if (!isValidGC(gc)) {
      return Promise.reject(new Error(`${logMessages.addGlobalContexts} ${logMessages.gcType}`));
    }
    return <Promise<void>>Promise.resolve(RNSnowplowTracker.addGlobalContexts({tracker:namespace, addGlobalContext: gc}));
  };
}

/**
 * Returns a function to set the subject userId
 *
 * @param namespace {string} - The tracker namespace
 * @returns - A function to set the userId
 */
function setUserId(namespace:string) {
  return function (newUid: string | null): Promise<void> {
    return subject.setUserId(namespace, newUid);
  };
}

/**
 * Returns a function to set the subject networkUserId
 *
 * @param namespace {string} - The tracker namespace
 * @returns - A function to set the networkUserId
 */
function setNetworkUserId(namespace:string) {
  return function (newNuid: string | null): Promise<void> {
    return subject.setNetworkUserId(namespace, newNuid);
  };
}

/**
 * Returns a function to set the subject domainUserId
 *
 * @param namespace {string} - The tracker namespace
 * @returns - A function to set the domainUserId
 */
function setDomainUserId(namespace:string) {
  return function (newDuid: string | null): Promise<void> {
    return subject.setDomainUserId(namespace, newDuid);
  };
}

/**
 * Returns a function to set the subject ipAddress
 *
 * @param namespace {string} - The tracker namespace
 * @returns - A function to set the ipAddress
 */
function setIpAddress(namespace:string) {
  return function (newIp: string | null): Promise<void> {
    return subject.setIpAddress(namespace, newIp);
  };
}

/**
 * Returns a function to set the subject useragent
 *
 * @param namespace {string} - The tracker namespace
 * @returns - A function to set the useragent
 */
function setUseragent(namespace:string) {
  return function (newUagent: string | null): Promise<void> {
    return subject.setUseragent(namespace, newUagent);
  };
}

/**
 * Returns a function to set the subject timezone
 *
 * @param namespace {string} - The tracker namespace
 * @returns - A function to set the timezone
 */
function setTimezone(namespace:string) {
  return function (newTz: string | null): Promise<void> {
    return subject.setTimezone(namespace, newTz);
  };
}

/**
 * Returns a function to set the subject language
 *
 * @param namespace {string} - The tracker namespace
 * @returns - A function to set the language
 */
function setLanguage(namespace:string) {
  return function (newLang: string | null): Promise<void> {
    return subject.setLanguage(namespace, newLang);
  };
}

/**
 * Returns a function to set the subject screenResolution
 *
 * @param namespace {string} - The tracker namespace
 * @returns - A function to set the screenResolution
 */
function setScreenResolution(namespace:string) {
  return function (newRes: ScreenSize | null): Promise<void> {
    return subject.setScreenResolution(namespace, newRes);
  };
}

/**
 * Returns a function to set the subject screenViewport
 *
 * @param namespace {string} - The tracker namespace
 * @returns - A function to set the screenViewport
 */
function setScreenViewport(namespace:string) {
  return function (newView: ScreenSize | null): Promise<void> {
    return subject.setScreenViewport(namespace, newView);
  };
}

/**
 * Returns a function to set the subject colorDepth
 *
 * @param namespace {string} - The tracker namespace
 * @returns - A function to set the colorDepth
 */
function setColorDepth(namespace:string) {
  return function (newColorD: number | null): Promise<void> {
    return subject.setColorDepth(namespace, newColorD);
  };
}

/**
 * Returns a function to set subject data
 *
 * @param namespace {string} - The tracker namespace
 * @returns - A function to set subject data
 */
function setSubjectData(namespace:string) {
  return function (config: SubjectConfiguration): Promise<void> {
    return subject.setSubjectData(namespace, config);
  };
}

/**
 * Returns a function to get the current session userId
 *
 * @param namespace {string} - The tracker namespace
 * @returns - A function to get the session userId
 */
function getSessionUserId(namespace: string) {
  return function (): Promise<string> {
    return <Promise<string>>Promise
      .resolve(RNSnowplowTracker.getSessionUserId({tracker: namespace}));
  };
}

/**
 * Returns a function to get the current sessionId
 *
 * @param namespace {string} - The tracker namespace
 * @returns - A function to get the sessionId
 */
function getSessionId(namespace: string) {
  return function (): Promise<string> {
    return <Promise<string>>Promise
      .resolve(RNSnowplowTracker.getSessionId({tracker: namespace}));
  };
}

/**
 * Returns a function to get the current session index
 *
 * @param namespace {string} - The tracker namespace
 * @returns - A function to get the session index
 */
function getSessionIndex(namespace: string) {
  return function (): Promise<number> {
    return <Promise<number>>Promise
      .resolve(RNSnowplowTracker.getSessionIndex({tracker: namespace}));
  };
}

/**
 * Returns a function to get whether the app is in background
 *
 * @param namespace {string} - The tracker namespace
 * @returns - A function to get whether the app isInBackground
 */
function getIsInBackground(namespace: string) {
  return function (): Promise<boolean> {
    return <Promise<boolean>>Promise
      .resolve(RNSnowplowTracker.getIsInBackground({tracker: namespace}));
  };
}

/**
 * Returns a function to get the background index
 *
 * @param namespace {string} - The tracker namespace
 * @returns - A function to get the backgroundIndex
 */
function getBackgroundIndex(namespace: string) {
  return function (): Promise<number> {
    return <Promise<number>>Promise
      .resolve(RNSnowplowTracker.getBackgroundIndex({tracker: namespace}));
  };
}

/**
 * Returns a function to get the foreground index
 *
 * @param namespace {string} - The tracker namespace
 * @returns - A function to get the foregroundIndex
 */
function getForegroundIndex(namespace: string) {
  return function (): Promise<number> {
    return <Promise<number>>Promise
      .resolve(RNSnowplowTracker.getForegroundIndex({tracker: namespace}));
  };
}

export {
  createTracker,
  removeTracker,
  removeAllTrackers,
  trackSelfDescribingEvent,
  trackScreenViewEvent,
  trackStructuredEvent,
  trackPageViewEvent,
  trackTimingEvent,
  trackConsentGrantedEvent,
  trackConsentWithdrawnEvent,
  trackEcommerceTransactionEvent,
  trackDeepLinkReceivedEvent,
  trackMessageNotificationEvent,
  removeGlobalContexts,
  addGlobalContexts,
  setUserId,
  setNetworkUserId,
  setDomainUserId,
  setIpAddress,
  setUseragent,
  setTimezone,
  setLanguage,
  setScreenResolution,
  setScreenViewport,
  setColorDepth,
  setSubjectData,
  getSessionUserId,
  getSessionId,
  getSessionIndex,
  getIsInBackground,
  getBackgroundIndex,
  getForegroundIndex,
};
