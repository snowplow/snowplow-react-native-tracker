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
import { logMessages } from './constants';
import {
  validateContexts,
  validateSelfDesc,
  validateScreenView,
  validateStructured,
  validatePageView,
  validateTiming,
  validateConsentGranted,
  validateConsentWithdrawn,
  validateEcommerceTransaction,
  validateDeepLinkReceived,
  validateMessageNotification
} from './events';
import type {
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
} from './types';

/**
 * Tracks a self-describing event
 *
 * @param namespace {string} - the tracker namespace
 * @param argmap {Object} - the event data
 * @param contexts {Array}- the event contexts
 * @returns {Promise}
 */
function trackSelfDescribingEvent(
  namespace: string,
  argmap: SelfDescribing,
  contexts: EventContext[] = []
): Promise<void> {
  return <Promise<void>>validateSelfDesc(argmap)
    .then(() => validateContexts(contexts))
    .then(() =>
      <Promise<void>>RNSnowplowTracker.trackSelfDescribingEvent({
        tracker: namespace,
        eventData: argmap,
        contexts: contexts
      }))
    .catch((error) => {
      throw new Error(`${logMessages.trackSelfDesc} ${error.message}`);
    });
}

/**
 * Tracks a screen-view event
 *
 * @param namespace {string} - the tracker namespace
 * @param argmap {Object} - the event data
 * @param contexts {Array}- the event contexts
 * @returns {Promise}
 */
function trackScreenViewEvent(
  namespace: string,
  argmap: ScreenViewProps,
  contexts: EventContext[] = []
): Promise<void> {
  return <Promise<void>>validateScreenView(argmap)
    .then(() => validateContexts(contexts))
    .then(() =>
      <Promise<void>>RNSnowplowTracker.trackScreenViewEvent({
        tracker: namespace,
        eventData: argmap,
        contexts: contexts}))
    .catch((error) => {
      throw new Error(`${logMessages.trackScreenView} ${error.message}`);
    });
}

/**
 * Tracks a structured event
 *
 * @param namespace {string} - the tracker namespace
 * @param argmap {Object} - the event data
 * @param contexts {Array}- the event contexts
 * @returns {Promise}
 */
function trackStructuredEvent(
  namespace: string,
  argmap: StructuredProps,
  contexts: EventContext[] = []
): Promise<void> {
  return <Promise<void>>validateStructured(argmap)
    .then(() => validateContexts(contexts))
    .then(() =>
      <Promise<void>>RNSnowplowTracker.trackStructuredEvent({
        tracker: namespace,
        eventData: argmap,
        contexts: contexts}))
    .catch((error) => {
      throw new Error(`${logMessages.trackStructured} ${error.message}`);
    });
}

/**
 * Tracks a page-view event
 *
 * @param namespace {string} - the tracker namespace
 * @param argmap {Object} - the event data
 * @param contexts {Array}- the event contexts
 * @returns {Promise}
 */
function trackPageViewEvent(
  namespace: string,
  argmap: PageViewProps,
  contexts: EventContext[] = []
): Promise<void> {
  return <Promise<void>>validatePageView(argmap)
    .then(() => validateContexts(contexts))
    .then(() =>
      <Promise<void>>RNSnowplowTracker.trackPageViewEvent({
        tracker: namespace,
        eventData: argmap,
        contexts: contexts}))
    .catch((error) => {
      throw new Error(`${logMessages.trackPageView} ${error.message}`);
    });
}

/**
 * Tracks a timing event
 *
 * @param namespace {string} - the tracker namespace
 * @param argmap {Object} - the event data
 * @param contexts {Array}- the event contexts
 * @returns {Promise}
 */
function trackTimingEvent(
  namespace: string,
  argmap: TimingProps,
  contexts: EventContext[] = []
): Promise<void> {
  return <Promise<void>>validateTiming(argmap)
    .then(() => validateContexts(contexts))
    .then(() =>
      <Promise<void>>RNSnowplowTracker.trackTimingEvent({
        tracker: namespace,
        eventData: argmap,
        contexts: contexts}))
    .catch((error) => {
      throw new Error(`${logMessages.trackTiming} ${error.message}`);
    });
}

/**
 * Tracks a consent-granted event
 *
 * @param namespace {string} - the tracker namespace
 * @param argmap {Object} - the event data
 * @param contexts {Array}- the event contexts
 * @returns {Promise}
 */
function trackConsentGrantedEvent(
  namespace: string,
  argmap: ConsentGrantedProps,
  contexts: EventContext[] = []
): Promise<void> {
  return <Promise<void>>validateConsentGranted(argmap)
    .then(() => validateContexts(contexts))
    .then(() =>
      <Promise<void>>RNSnowplowTracker.trackConsentGrantedEvent({
        tracker: namespace,
        eventData: argmap,
        contexts: contexts}))
    .catch((error) => {
      throw new Error(`${logMessages.trackConsentGranted} ${error.message}`);
    });
}

/**
 * Tracks a consent-withdrawn event
 *
 * @param namespace {string} - the tracker namespace
 * @param argmap {Object} - the event data
 * @param contexts {Array}- the event contexts
 * @returns {Promise}
 */
function trackConsentWithdrawnEvent(
  namespace: string,
  argmap: ConsentWithdrawnProps,
  contexts: EventContext[] = []
): Promise<void> {
  return <Promise<void>>validateConsentWithdrawn(argmap)
    .then(() => validateContexts(contexts))
    .then(() =>
      <Promise<void>>RNSnowplowTracker.trackConsentWithdrawnEvent({
        tracker: namespace,
        eventData: argmap,
        contexts: contexts}))
    .catch((error) => {
      throw new Error(`${logMessages.trackConsentWithdrawn} ${error.message}`);
    });
}

/**
 * Tracks an ecommerce-transaction event
 *
 * @param namespace {string} - the tracker namespace
 * @param argmap {Object} - the event data
 * @param contexts {Array}- the event contexts
 * @returns {Promise}
 */
function trackEcommerceTransactionEvent(
  namespace: string,
  argmap: EcommerceTransactionProps,
  contexts: EventContext[] = []
): Promise<void> {
  return <Promise<void>>validateEcommerceTransaction(argmap)
    .then(() => validateContexts(contexts))
    .then(() =>
      <Promise<void>>RNSnowplowTracker.trackEcommerceTransactionEvent({
        tracker: namespace,
        eventData: argmap,
        contexts: contexts}))
    .catch((error) => {
      throw new Error(`${logMessages.trackEcommerceTransaction} ${error.message}`);
    });
}

/**
 * Tracks a deep link received event
 *
 * @param namespace {string} - the tracker namespace
 * @param argmap {Object} - the event data
 * @param contexts {Array}- the event contexts
 * @returns {Promise}
 */
function trackDeepLinkReceivedEvent(
  namespace: string,
  argmap: DeepLinkReceivedProps,
  contexts: EventContext[] = []
): Promise<void> {
  return <Promise<void>>validateDeepLinkReceived(argmap)
    .then(() => validateContexts(contexts))
    .then(() =>
      <Promise<void>>RNSnowplowTracker.trackDeepLinkReceivedEvent({
        tracker: namespace,
        eventData: argmap,
        contexts: contexts}))
    .catch((error) => {
      throw new Error(`${logMessages.trackDeepLinkReceived} ${error.message}`);
    });
}

/**
 * Tracks a message notification event
 *
 * @param namespace {string} - the tracker namespace
 * @param argmap {Object} - the event data
 * @param contexts {Array}- the event contexts
 * @returns {Promise}
 */
function trackMessageNotificationEvent(
  namespace: string,
  argmap: MessageNotificationProps,
  contexts: EventContext[] = []
): Promise<void> {
  return <Promise<void>>validateMessageNotification(argmap)
    .then(() => validateContexts(contexts))
    .then(() =>
      <Promise<void>>RNSnowplowTracker.trackMessageNotificationEvent({
        tracker: namespace,
        eventData: argmap,
        contexts: contexts}))
    .catch((error) => {
      throw new Error(`${logMessages.trackMessageNotification} ${error.message}`);
    });
}

export {
  trackSelfDescribingEvent,
  trackScreenViewEvent,
  trackStructuredEvent,
  trackPageViewEvent,
  trackTimingEvent,
  trackConsentGrantedEvent,
  trackConsentWithdrawnEvent,
  trackEcommerceTransactionEvent,
  trackDeepLinkReceivedEvent,
  trackMessageNotificationEvent
};
