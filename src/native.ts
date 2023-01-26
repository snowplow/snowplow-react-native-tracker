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
import type {
  ConsentGrantedProps,
  ConsentWithdrawnProps,
  DeepLinkReceivedProps,
  EcommerceTransactionProps,
  EventContext,
  GlobalContext,
  InitTrackerConfiguration,
  MessageNotificationProps,
  PageViewProps,
  ScreenSize,
  ScreenViewProps,
  SelfDescribing,
  StructuredProps,
  TimingProps,
} from './types';
import { errorHandler } from './utils';

interface Native {
  createTracker: (configuration: InitTrackerConfiguration) => Promise<void>;
  removeTracker: (details: { tracker: string }) => Promise<boolean>;
  removeAllTrackers: () => Promise<boolean>;
  trackSelfDescribingEvent: (details: {
    tracker: string | null;
    eventData: SelfDescribing;
    contexts: EventContext[];
  }) => Promise<void>;
  trackStructuredEvent: (details: {
    tracker: string | null;
    eventData: StructuredProps;
    contexts: EventContext[];
  }) => Promise<void>;
  trackScreenViewEvent: (details: {
    tracker: string | null;
    eventData: ScreenViewProps;
    contexts: EventContext[];
  }) => Promise<void>;
  trackPageViewEvent: (details: {
    tracker: string | null;
    eventData: PageViewProps;
    contexts: EventContext[];
  }) => Promise<void>;
  trackTimingEvent: (details: {
    tracker: string | null;
    eventData: TimingProps;
    contexts: EventContext[];
  }) => Promise<void>;
  trackConsentGrantedEvent: (details: {
    tracker: string | null;
    eventData: ConsentGrantedProps;
    contexts: EventContext[];
  }) => Promise<void>;
  trackConsentWithdrawnEvent: (details: {
    tracker: string | null;
    eventData: ConsentWithdrawnProps;
    contexts: EventContext[];
  }) => Promise<void>;
  trackEcommerceTransactionEvent: (details: {
    tracker: string | null;
    eventData: EcommerceTransactionProps;
    contexts: EventContext[];
  }) => Promise<void>;
  trackDeepLinkReceivedEvent: (details: {
    tracker: string | null;
    eventData: DeepLinkReceivedProps;
    contexts: EventContext[];
  }) => Promise<void>;
  trackMessageNotificationEvent: (details: {
    tracker: string | null;
    eventData: MessageNotificationProps;
    contexts: EventContext[];
  }) => Promise<void>;
  removeGlobalContexts: (details: {
    tracker: string;
    removeTag: string;
  }) => Promise<void>;
  addGlobalContexts: (details: {
    tracker: string;
    addGlobalContext: GlobalContext;
  }) => Promise<void>;
  setUserId: (details: {
    tracker: string;
    userId: string | null;
  }) => Promise<void>;
  setNetworkUserId: (details: {
    tracker: string;
    networkUserId: string | null;
  }) => Promise<void>;
  setDomainUserId: (details: {
    tracker: string;
    domainUserId: string | null;
  }) => Promise<void>;
  setIpAddress: (details: {
    tracker: string;
    ipAddress: string | null;
  }) => Promise<void>;
  setUseragent: (details: {
    tracker: string;
    useragent: string | null;
  }) => Promise<void>;
  setTimezone: (details: {
    tracker: string;
    timezone: string | null;
  }) => Promise<void>;
  setLanguage: (details: {
    tracker: string;
    language: string | null;
  }) => Promise<void>;
  setScreenResolution: (details: {
    tracker: string;
    screenResolution: ScreenSize | null;
  }) => Promise<void>;
  setScreenViewport: (details: {
    tracker: string;
    screenViewport: ScreenSize | null;
  }) => Promise<void>;
  setColorDepth: (details: {
    tracker: string;
    colorDepth: number | null;
  }) => Promise<void>;
  getSessionUserId: (details: {
    tracker: string;
  }) => Promise<string>;
  getSessionId: (details: {
    tracker: string;
  }) => Promise<string>;
  getSessionIndex: (details: {
    tracker: string;
  }) => Promise<number>;
  getIsInBackground: (details: {
    tracker: string;
  }) => Promise<boolean>;
  getBackgroundIndex: (details: {
    tracker: string;
  }) => Promise<number>;
  getForegroundIndex: (details: {
    tracker: string;
  }) => Promise<number>;
}

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
