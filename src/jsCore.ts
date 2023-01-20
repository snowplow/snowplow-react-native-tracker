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

import type {
  InitTrackerConfiguration,
  SelfDescribing,
  EventContext,
  StructuredProps,
  ScreenViewProps,
  GlobalContext,
  ScreenSize,
  PageViewProps,
  TimingProps,
  ConsentGrantedProps,
  ConsentWithdrawnProps,
  EcommerceTransactionProps,
  DeepLinkReceivedProps,
  MessageNotificationProps,
} from "./types";

import {
  Payload,
  trackerCore,
  PayloadBuilder,
  buildSelfDescribingEvent,
  buildStructEvent,
  buildScreenView,
  buildPageView,
  buildConsentGranted,
  buildConsentWithdrawn,
  buildEcommerceTransaction,
} from "@snowplow/tracker-core";
import type { TrackerCore } from "@snowplow/tracker-core";

const packageJson = require('../package.json');
const trackerVersion = `rn-${packageJson.version}`;

interface Tracker extends TrackerCore {
  setDomainUserId: (duid: string | undefined) => void;
}

let trackers: { [namespace: string]: Tracker } = {};

function createTracker(
  configuration: InitTrackerConfiguration,
  emitCallback?: (e: Payload) => void
) {
  // create an emit callback if not given
  emitCallback ??= createEmitCallback(configuration);

  // the tracker core does not provide an option to set the duid, so we need to add custom
  let domainUserId: String | undefined;
  const setDomainUserId = (userId: string | undefined): void => {
    domainUserId = userId;
  };

  // initialize the tracker core
  const core = trackerCore({
    base64: configuration.trackerConfig?.base64Encoding ?? true,
    callback: (payload: PayloadBuilder) => {
      if (domainUserId) {
        payload.add("duid", domainUserId);
      }
      const builtPayload = payload.build();
      if (emitCallback) {
        emitCallback(builtPayload);
      }
    },
  });
  const tracker = { ...core, setDomainUserId };
  trackers[configuration.namespace] = tracker;

  // update tracker properties to reflect subject and tracker info
  updateTrackerProperties(tracker, configuration);

  return <Promise<void>>Promise.resolve();
}

function createEmitCallback(configuration: InitTrackerConfiguration) {
  return (e: Payload) => {
    const postJson = {
      schema:
        "iglu:com.snowplowanalytics.snowplow/payload_data/jsonschema/1-0-4",
      data: [preparePayload(e)],
    };
    let endpoint = configuration.networkConfig.endpoint;
    let postPath =
      configuration.networkConfig.customPostPath ??
      "/com.snowplowanalytics.snowplow/tp2";
    fetch(endpoint + postPath, {
      method: "POST",
      body: JSON.stringify(postJson),
      headers: {
        "Content-Type": "application/json",
      },
    }).catch(console.error);
  };
}

function updateTrackerProperties(tracker: Tracker, configuration: InitTrackerConfiguration) {
  tracker.setPlatform(configuration.trackerConfig?.devicePlatform ?? "mob");
  tracker.setTrackerVersion(trackerVersion);
  tracker.setTrackerNamespace(configuration.namespace);
  if (configuration.trackerConfig?.appId) {
    tracker.setAppId(configuration.trackerConfig?.appId);
  }
  if (configuration.subjectConfig?.colorDepth) {
    tracker.setColorDepth(String(configuration.subjectConfig.colorDepth));
  }
  if (configuration.subjectConfig?.domainUserId) {
    tracker.setDomainUserId(configuration.subjectConfig.domainUserId);
  }
  if (configuration.subjectConfig?.ipAddress) {
    tracker.setIpAddress(configuration.subjectConfig.ipAddress);
  }
  if (configuration.subjectConfig?.language) {
    tracker.setLang(configuration.subjectConfig.language);
  }
  if (configuration.subjectConfig?.screenResolution) {
    tracker.setScreenResolution(
      String(configuration.subjectConfig.screenResolution[0]),
      String(configuration.subjectConfig.screenResolution[1])
    );
  }
  if (configuration.subjectConfig?.screenViewport) {
    tracker.setViewport(
      String(configuration.subjectConfig.screenViewport[0]),
      String(configuration.subjectConfig.screenViewport[1])
    );
  }
  if (configuration.subjectConfig?.timezone) {
    tracker.setTimezone(configuration.subjectConfig.timezone);
  }
  if (configuration.subjectConfig?.userId) {
    tracker.setUserId(configuration.subjectConfig.userId);
  }
  if (configuration.subjectConfig?.useragent) {
    tracker.setUseragent(configuration.subjectConfig.useragent);
  }
}

function removeTracker(details: { tracker: string }) {
  delete trackers[details.tracker];
  return <Promise<void>>Promise.resolve();
}

function removeAllTrackers() {
  trackers = {};
  return <Promise<void>>Promise.resolve();
}

function trackSelfDescribingEvent(details: {
  tracker: string | null;
  eventData: SelfDescribing;
  contexts: EventContext[];
}) {
  forTracker(details.tracker, (tracker) => {
    tracker.track(
      buildSelfDescribingEvent({
        event: details.eventData,
      }),
      details.contexts
    );
  });
  return <Promise<void>>Promise.resolve();
}

function trackStructuredEvent(details: {
  tracker: string | null;
  eventData: StructuredProps;
  contexts: EventContext[];
}) {
  forTracker(details.tracker, (tracker) => {
    tracker.track(buildStructEvent(details.eventData), details.contexts);
  });
  return <Promise<void>>Promise.resolve();
}

function trackScreenViewEvent(details: {
  tracker: string | null;
  eventData: ScreenViewProps;
  contexts: EventContext[];
}) {
  forTracker(details.tracker, (tracker) => {
    tracker.track(buildScreenView(details.eventData), details.contexts);
  });
  return <Promise<void>>Promise.resolve();
}

function trackPageViewEvent(details: {
  tracker: string | null;
  eventData: PageViewProps;
  contexts: EventContext[];
}) {
  forTracker(details.tracker, (tracker) => {
    tracker.track(buildPageView(details.eventData), details.contexts);
  });
  return <Promise<void>>Promise.resolve();
}

function trackTimingEvent(details: {
  tracker: string | null;
  eventData: TimingProps;
  contexts: EventContext[];
}) {
  trackSelfDescribingEvent({
    tracker: details.tracker,
    eventData: {
      schema: "iglu:com.snowplowanalytics.snowplow/timing/jsonschema/1-0-0",
      data: details.eventData,
    },
    contexts: details.contexts,
  });
  return <Promise<void>>Promise.resolve();
}

function trackConsentGrantedEvent(details: {
  tracker: string | null;
  eventData: ConsentGrantedProps;
  contexts: EventContext[];
}) {
  forTracker(details.tracker, (tracker) => {
    let built = buildConsentGranted({
      id: details.eventData.documentId,
      version: details.eventData.version,
      description: details.eventData.documentDescription,
      expiry: details.eventData.expiry,
    });
    tracker.track(built.event, details.contexts.concat(built.context));
  });
  return <Promise<void>>Promise.resolve();
}

function trackConsentWithdrawnEvent(details: {
  tracker: string | null;
  eventData: ConsentWithdrawnProps;
  contexts: EventContext[];
}) {
  forTracker(details.tracker, (tracker) => {
    let built = buildConsentWithdrawn({
      all: details.eventData.all,
      id: details.eventData.documentId,
      version: details.eventData.version,
      description: details.eventData.documentDescription,
    });
    tracker.track(built.event, details.contexts.concat(built.context));
  });
  return <Promise<void>>Promise.resolve();
}

function trackEcommerceTransactionEvent(details: {
  tracker: string | null;
  eventData: EcommerceTransactionProps;
  contexts: EventContext[];
}) {
  forTracker(details.tracker, (tracker) => {
    tracker.track(
      buildEcommerceTransaction({
        orderId: details.eventData.orderId,
        total: details.eventData.totalValue,
        affiliation: details.eventData.affiliation,
        tax: details.eventData.taxValue,
        shipping: details.eventData.shipping,
        city: details.eventData.city,
        state: details.eventData.state,
        country: details.eventData.country,
        currency: details.eventData.currency,
      }),
      details.contexts
    );
  });
  return <Promise<void>>Promise.resolve();
}

function trackDeepLinkReceivedEvent(details: {
  tracker: string | null;
  eventData: DeepLinkReceivedProps;
  contexts: EventContext[];
}) {
  trackSelfDescribingEvent({
    tracker: details.tracker,
    eventData: {
      schema:
        "iglu:com.snowplowanalytics.mobile/deep_link_received/jsonschema/1-0-0",
      data: details.eventData,
    },
    contexts: details.contexts,
  });
  return <Promise<void>>Promise.resolve();
}

function trackMessageNotificationEvent(details: {
  tracker: string | null;
  eventData: MessageNotificationProps;
  contexts: EventContext[];
}) {
  trackSelfDescribingEvent({
    tracker: details.tracker,
    eventData: {
      schema:
        "iglu:com.snowplowanalytics.mobile/message_notification/jsonschema/1-0-0",
      data: details.eventData,
    },
    contexts: details.contexts,
  });
  return <Promise<void>>Promise.resolve();
}

function removeGlobalContexts(details: { tracker: string; removeTag: string }) {
  details;
  return <Promise<void>>Promise.reject("Not implemented");
}

function addGlobalContexts(details: {
  tracker: string;
  addGlobalContext: GlobalContext;
}) {
  details;
  return <Promise<void>>Promise.reject("Not implemented");
}

function setUserId(details: { tracker: string; userId: string | null }) {
  if (details.userId) {
    trackers[details.tracker]?.setUserId(details.userId);
  }
  return <Promise<void>>Promise.resolve();
}

function setNetworkUserId(_: {
  tracker: string;
  networkUserId: string | null;
}) {
  return <Promise<void>>Promise.reject("Not implemented");
}

function setDomainUserId(details: {
  tracker: string;
  domainUserId: string | null;
}) {
  if (details.domainUserId) {
    trackers[details.tracker]?.setDomainUserId(details.domainUserId);
  }
  return <Promise<void>>Promise.resolve();
}

function setIpAddress(details: { tracker: string; ipAddress: string | null }) {
  if (details.ipAddress) {
    trackers[details.tracker]?.setIpAddress(details.ipAddress);
  }
  return <Promise<void>>Promise.resolve();
}

function setUseragent(details: { tracker: string; useragent: string | null }) {
  if (details.useragent) {
    trackers[details.tracker]?.setUseragent(details.useragent);
  }
  return <Promise<void>>Promise.resolve();
}

function setTimezone(details: { tracker: string; timezone: string | null }) {
  if (details.timezone) {
    trackers[details.tracker]?.setTimezone(details.timezone);
  }
  return <Promise<void>>Promise.resolve();
}

function setLanguage(details: { tracker: string; language: string | null }) {
  if (details.language) {
    trackers[details.tracker]?.setLang(details.language);
  }
  return <Promise<void>>Promise.resolve();
}

function setScreenResolution(details: {
  tracker: string;
  screenResolution: ScreenSize | null;
}) {
  if (details.screenResolution) {
    trackers[details.tracker]?.setScreenResolution(
      String(details.screenResolution[0]),
      String(details.screenResolution[1])
    );
  }
  return <Promise<void>>Promise.resolve();
}

function setScreenViewport(details: {
  tracker: string;
  screenViewport: ScreenSize | null;
}) {
  if (details.screenViewport) {
    trackers[details.tracker]?.setViewport(
      String(details.screenViewport[0]),
      String(details.screenViewport[1])
    );
  }
  return <Promise<void>>Promise.resolve();
}

function setColorDepth(details: {
  tracker: string;
  colorDepth: number | null;
}) {
  if (details.colorDepth) {
    trackers[details.tracker]?.setColorDepth(String(details.colorDepth));
  }
  return <Promise<void>>Promise.resolve();
}

function getSessionUserId(_: { tracker: string }) {
  return <Promise<string>>Promise.reject("Not implemented");
}

function getSessionId(_: { tracker: string }) {
  return <Promise<string>>Promise.reject("Not implemented");
}

function getSessionIndex(_: { tracker: string }) {
  return <Promise<number>>Promise.reject("Not implemented");
}

function getIsInBackground(_: { tracker: string }) {
  return <Promise<boolean>>Promise.reject("Not implemented");
}

function getBackgroundIndex(_: { tracker: string }) {
  return <Promise<number>>Promise.reject("Not implemented");
}

function getForegroundIndex(_: { tracker: string }) {
  return <Promise<number>>Promise.reject("Not implemented");
}

function forTracker(
  namespace: string | null,
  callback: (tracker: Tracker) => void
) {
  let tracker = namespace ? trackers[namespace] : Object.values(trackers)[0];

  if (tracker) {
    callback(tracker);
  } else {
    console.error("No such tracker found.");
  }
}

function preparePayload(payload: Payload) {
  const stringifiedPayload: Record<string, string> = {};

  payload["stm"] = new Date().getTime().toString();

  for (const key in payload) {
    if (Object.prototype.hasOwnProperty.call(payload, key)) {
      stringifiedPayload[key] = String(payload[key]);
    }
  }
  return stringifiedPayload;
}

const JSSnowplowTracker = {
  createTracker,
  removeTracker,
  removeAllTrackers,
  trackSelfDescribingEvent,
  trackStructuredEvent,
  trackScreenViewEvent,
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
  getSessionUserId,
  getSessionId,
  getSessionIndex,
  getIsInBackground,
  getBackgroundIndex,
  getForegroundIndex,
};

export { JSSnowplowTracker };
