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

import * as api from './api';
import { safeWait, safeWaitCallback, errorHandler } from './utils';
import type {
  NetworkConfiguration,
  TrackerControllerConfiguration,
  ReactNativeTracker
} from './types';

/**
 * Creates a React Native Tracker object
 *
 * @param namespace {string} - The tracker namespace
 * @param networkConfig {Object} - The network configuration
 * @param control {Array} - The tracker controller configuration
 * @returns The tracker object
 */
function createTracker(
  namespace: string,
  networkConfig: NetworkConfiguration,
  controllerConfig: TrackerControllerConfiguration = {}
): ReactNativeTracker {
  // initTrackerPromise
  const initTrackerPromise: Promise<void> = Promise.resolve(
    api.createTracker({
      namespace,
      networkConfig,
      ...controllerConfig
    })
  );

  // mkMethod creates methods subscribed to the initTrackerPromise
  const mkMethod = safeWait(initTrackerPromise, errorHandler);

  // mkCallback creates callbacks subscribed to the initTrackerPromise
  const mkCallback = safeWaitCallback(initTrackerPromise, errorHandler);

  // track methods
  const trackSelfDescribingEvent = mkMethod(api.trackSelfDescribingEvent(namespace));
  const trackScreenViewEvent = mkMethod(api.trackScreenViewEvent(namespace));
  const trackStructuredEvent = mkMethod(api.trackStructuredEvent(namespace));
  const trackPageViewEvent = mkMethod(api.trackPageViewEvent(namespace));
  const trackTimingEvent = mkMethod(api.trackTimingEvent(namespace));
  const trackConsentGrantedEvent = mkMethod(api.trackConsentGrantedEvent(namespace));
  const trackConsentWithdrawnEvent = mkMethod(api.trackConsentWithdrawnEvent(namespace));
  const trackEcommerceTransactionEvent = mkMethod(api.trackEcommerceTransactionEvent(namespace));
  const trackDeepLinkReceivedEvent = mkMethod(api.trackDeepLinkReceivedEvent(namespace));
  const trackMessageNotificationEvent = mkMethod(api.trackMessageNotificationEvent(namespace));
  // Global Contexts
  const removeGlobalContexts = mkMethod(api.removeGlobalContexts(namespace));
  const addGlobalContexts = mkMethod(api.addGlobalContexts(namespace));
  // setters
  const setUserId = mkMethod(api.setUserId(namespace));
  const setNetworkUserId = mkMethod(api.setNetworkUserId(namespace));
  const setDomainUserId = mkMethod(api.setDomainUserId(namespace));
  const setIpAddress = mkMethod(api.setIpAddress(namespace));
  const setUseragent = mkMethod(api.setUseragent(namespace));
  const setTimezone = mkMethod(api.setTimezone(namespace));
  const setLanguage = mkMethod(api.setLanguage(namespace));
  const setScreenResolution = mkMethod(api.setScreenResolution(namespace));
  const setScreenViewport = mkMethod(api.setScreenViewport(namespace));
  const setColorDepth = mkMethod(api.setColorDepth(namespace));
  const setSubjectData = mkMethod(api.setSubjectData(namespace));

  // callbacks
  const getSessionUserId = mkCallback(api.getSessionUserId(namespace));
  const getSessionId = mkCallback(api.getSessionId(namespace));
  const getSessionIndex = mkCallback(api.getSessionIndex(namespace));
  const getIsInBackground = mkCallback(api.getIsInBackground(namespace));
  const getBackgroundIndex = mkCallback(api.getBackgroundIndex(namespace));
  const getForegroundIndex = mkCallback(api.getForegroundIndex(namespace));

  return Object.freeze({
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
  });
}

/**
 * Removes a tracker given its namespace
 *
 * @param trackerNamespace {string}
 * @returns - A boolean promise
 */
function removeTracker(trackerNamespace: string): Promise<boolean> {
  return <Promise<boolean>>api.removeTracker(trackerNamespace)
    .catch((e) => errorHandler(e));
}

/**
 * Removes all trackers
 *
 * @returns - A boolean promise
 */
function removeAllTrackers(): Promise<boolean> {
  return <Promise<boolean>>api.removeAllTrackers()
    .catch((e) => errorHandler(e));
}


export {
  createTracker,
  removeTracker,
  removeAllTrackers,
};

export type {
  ReactNativeTracker,
  TrackerControllerConfiguration,
  NetworkConfiguration,
  TrackerConfiguration,
  SessionConfiguration,
  EmitterConfiguration,
  SubjectConfiguration,
  GdprConfiguration,
  GCConfiguration,
  SelfDescribing,
  EventContext,
  ScreenViewProps,
  StructuredProps,
  PageViewProps,
  TimingProps,
  ConsentGrantedProps,
  ConsentWithdrawnProps,
  EcommerceTransactionProps,
  DeepLinkReceivedProps,
  MessageNotificationProps,
  EcommerceItem,
  ConsentDocument,
  GlobalContext,
  HttpMethod,
  DevicePlatform,
  LogLevel,
  Basis,
  BufferOption,
  ScreenSize,
  Trigger
} from './types';
