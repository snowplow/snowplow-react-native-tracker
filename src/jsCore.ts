'use strict';

import type {
  InitTrackerConfiguration,
  SelfDescribing,
  EventContext,
  StructuredProps,
  ScreenViewProps,
  ScreenSize,
  PageViewProps,
  TimingProps,
  ConsentGrantedProps,
  ConsentWithdrawnProps,
  EcommerceTransactionProps,
  DeepLinkReceivedProps,
  MessageNotificationProps,
  NetworkConfiguration,
  ScrollChangedProps,
  ListItemViewProps,
} from './types';

import {
  type Payload,
  trackerCore,
  type PayloadBuilder,
  buildSelfDescribingEvent,
  buildStructEvent,
  buildPageView,
  buildConsentGranted,
  buildConsentWithdrawn,
  buildEcommerceTransaction,
  buildEcommerceTransactionItem,
} from '@snowplow/tracker-core';
import type { TrackerCore } from '@snowplow/tracker-core';
import { errorHandler } from './utils';
import { schemas } from './constants';
import { v4 as uuid } from 'uuid';

// Tracker version added to the events
const trackerVersion = 'rn-2.1.0';

interface Tracker extends TrackerCore {
  setDomainUserId: (duid: string | undefined) => void;
  setNetworkUserId: (nuid: string | undefined) => void;
}

let trackers: { [namespace: string]: Tracker } = {};

function preparePayload(payload: Payload): Record<string, string> {
  const stringifiedPayload: Record<string, string> = {};

  payload.stm = new Date().getTime().toString();

  for (const key in payload) {
    if (Object.prototype.hasOwnProperty.call(payload, key)) {
      stringifiedPayload[key] = String(payload[key]);
    }
  }
  return stringifiedPayload;
}

function createEmitCallback(
  networkConfig: NetworkConfiguration
): (e: Payload) => void {
  return (e: Payload) => {
    const postJson = {
      schema: schemas.payloadData,
      data: [preparePayload(e)],
    };
    const endpoint = networkConfig.endpoint;
    const postPath =
      networkConfig.customPostPath ?? '/com.snowplowanalytics.snowplow/tp2';
    const headers = networkConfig.requestHeaders ?? {};
    fetch(endpoint + postPath, {
      method: 'POST',
      body: JSON.stringify(postJson),
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
    }).catch(errorHandler);
  };
}

function updateTrackerProperties(
  tracker: Tracker,
  configuration: InitTrackerConfiguration
): void {
  tracker.setPlatform(configuration.trackerConfig?.devicePlatform ?? 'mob');
  tracker.setTrackerVersion(trackerVersion);
  tracker.setTrackerNamespace(configuration.namespace);
  if (configuration.trackerConfig?.appId != null) {
    tracker.setAppId(configuration.trackerConfig.appId);
  }
  if (configuration.subjectConfig?.colorDepth != null) {
    tracker.setColorDepth(String(configuration.subjectConfig.colorDepth));
  }
  if (configuration.subjectConfig?.domainUserId != null) {
    tracker.setDomainUserId(configuration.subjectConfig.domainUserId);
  }
  if (configuration.subjectConfig?.ipAddress != null) {
    tracker.setIpAddress(configuration.subjectConfig.ipAddress);
  }
  if (configuration.subjectConfig?.language != null) {
    tracker.setLang(configuration.subjectConfig.language);
  }
  if (configuration.subjectConfig?.screenResolution != null) {
    tracker.setScreenResolution(
      String(configuration.subjectConfig.screenResolution[0]),
      String(configuration.subjectConfig.screenResolution[1])
    );
  }
  if (configuration.subjectConfig?.screenViewport != null) {
    tracker.setViewport(
      String(configuration.subjectConfig.screenViewport[0]),
      String(configuration.subjectConfig.screenViewport[1])
    );
  }
  if (configuration.subjectConfig?.timezone != null) {
    tracker.setTimezone(configuration.subjectConfig.timezone);
  }
  if (configuration.subjectConfig?.userId != null) {
    tracker.setUserId(configuration.subjectConfig.userId);
  }
  if (configuration.subjectConfig?.useragent != null) {
    tracker.setUseragent(configuration.subjectConfig.useragent);
  }
}

function createTracker(
  configuration: InitTrackerConfiguration,
  emitCallback?: (e: Payload) => void
): Promise<void> {
  // create an emit callback if not given
  const emitter =
    emitCallback ?? createEmitCallback(configuration.networkConfig);

  // the tracker core does not provide an option to set the duid, so we need to add custom
  let domainUserId: string | undefined;
  const setDomainUserId = (userId: string | undefined): void => {
    domainUserId = userId;
  };
  let networkUserId: string | undefined;
  const setNetworkUserId = (userId: string | undefined): void => {
    networkUserId = userId;
  };

  // initialize the tracker core
  const core = trackerCore({
    base64: configuration.trackerConfig?.base64Encoding ?? true,
    callback: (payload: PayloadBuilder) => {
      if (domainUserId != null) {
        payload.add('duid', domainUserId);
      }
      if (networkUserId != null) {
        payload.add('tnuid', networkUserId);
      }
      const builtPayload = payload.build();
      emitter(builtPayload);
    },
  });
  const tracker = { ...core, setDomainUserId, setNetworkUserId };
  trackers[configuration.namespace] = tracker;

  // update tracker properties to reflect subject and tracker info
  updateTrackerProperties(tracker, configuration);

  return <Promise<void>>Promise.resolve();
}

function removeTracker(details: { tracker: string }): Promise<boolean> {
  delete trackers[details.tracker];
  return <Promise<boolean>>Promise.resolve(true);
}

function removeAllTrackers(): Promise<boolean> {
  trackers = {};
  return <Promise<boolean>>Promise.resolve(true);
}

function forTracker(
  namespace: string | null,
  callback: (tracker: Tracker) => void
): void {
  const tracker =
    namespace != null ? trackers[namespace] : Object.values(trackers)[0];

  if (tracker) {
    callback(tracker);
  } else {
    errorHandler(new Error('No such tracker found.'));
  }
}

function trackSelfDescribingEvent(details: {
  tracker: string | null;
  eventData: SelfDescribing;
  contexts: EventContext[];
}): Promise<void> {
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
}): Promise<void> {
  forTracker(details.tracker, (tracker) => {
    tracker.track(buildStructEvent(details.eventData), details.contexts);
  });
  return <Promise<void>>Promise.resolve();
}

function trackScreenViewEvent(details: {
  tracker: string | null;
  eventData: ScreenViewProps;
  contexts: EventContext[];
}): Promise<void> {
  const data: ScreenViewProps = {
    name: details.eventData.name,
    id: details.eventData.id ?? uuid(),
  };
  if (details.eventData.type != null) {
    data.type = details.eventData.type;
  }
  if (details.eventData.previousName != null) {
    data.previousName = details.eventData.previousName;
  }
  if (details.eventData.previousId != null) {
    data.previousId = details.eventData.previousId;
  }
  if (details.eventData.previousType != null) {
    data.previousType = details.eventData.previousType;
  }
  if (details.eventData.transitionType != null) {
    data.transitionType = details.eventData.transitionType;
  }

  return trackSelfDescribingEvent({
    tracker: details.tracker,
    eventData: {
      schema: schemas.screenViewSchema,
      data: data,
    },
    contexts: details.contexts,
  });
}

function trackScrollChangedEvent(details: {
  tracker: string | null;
  eventData: ScrollChangedProps;
  contexts: EventContext[];
}): Promise<void> {
  const data: Record<string, number> = {};

  if (details.eventData.yOffset != null) {
    data.y_offset = details.eventData.yOffset;
  }
  if (details.eventData.xOffset != null) {
    data.x_offset = details.eventData.xOffset;
  }
  if (details.eventData.viewHeight != null) {
    data.view_height = details.eventData.viewHeight;
  }
  if (details.eventData.viewWidth != null) {
    data.view_width = details.eventData.viewWidth;
  }
  if (details.eventData.contentHeight != null) {
    data.content_height = details.eventData.contentHeight;
  }
  if (details.eventData.contentWidth != null) {
    data.content_width = details.eventData.contentWidth;
  }

  return trackSelfDescribingEvent({
    tracker: details.tracker,
    eventData: {
      schema: schemas.scrollChangedSchema,
      data: data,
    },
    contexts: details.contexts,
  });
}

function trackListItemViewEvent(details: {
  tracker: string | null;
  eventData: ListItemViewProps;
  contexts: EventContext[];
}): Promise<void> {
  const data: Record<string, number> = {
    index: details.eventData.index,
  };

  if (details.eventData.itemsCount != null) {
    data.items_count = details.eventData.itemsCount;
  }

  return trackSelfDescribingEvent({
    tracker: details.tracker,
    eventData: {
      schema: schemas.listItemViewSchema,
      data: data,
    },
    contexts: details.contexts,
  });
}

function trackPageViewEvent(details: {
  tracker: string | null;
  eventData: PageViewProps;
  contexts: EventContext[];
}): Promise<void> {
  forTracker(details.tracker, (tracker) => {
    tracker.track(buildPageView(details.eventData), details.contexts);
  });
  return <Promise<void>>Promise.resolve();
}

function trackTimingEvent(details: {
  tracker: string | null;
  eventData: TimingProps;
  contexts: EventContext[];
}): Promise<void> {
  return trackSelfDescribingEvent({
    tracker: details.tracker,
    eventData: {
      schema: schemas.timingSchema,
      data: details.eventData,
    },
    contexts: details.contexts,
  });
}

function trackConsentGrantedEvent(details: {
  tracker: string | null;
  eventData: ConsentGrantedProps;
  contexts: EventContext[];
}): Promise<void> {
  forTracker(details.tracker, (tracker) => {
    const built = buildConsentGranted({
      id: details.eventData.documentId,
      version: details.eventData.version,
      name: details.eventData.name,
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
}): Promise<void> {
  forTracker(details.tracker, (tracker) => {
    const built = buildConsentWithdrawn({
      all: details.eventData.all,
      id: details.eventData.documentId,
      version: details.eventData.version,
      name: details.eventData.name,
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
}): Promise<void> {
  forTracker(details.tracker, (tracker) => {
    details.eventData.items.forEach((item) => {
      tracker.track(
        buildEcommerceTransactionItem({
          ...item,
          orderId: details.eventData.orderId,
        }),
        details.contexts
      );
    });
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
}): Promise<void> {
  return trackSelfDescribingEvent({
    tracker: details.tracker,
    eventData: {
      schema: schemas.deepLinkReceivedSchema,
      data: details.eventData,
    },
    contexts: details.contexts,
  });
}

function trackMessageNotificationEvent(details: {
  tracker: string | null;
  eventData: MessageNotificationProps;
  contexts: EventContext[];
}): Promise<void> {
  return trackSelfDescribingEvent({
    tracker: details.tracker,
    eventData: {
      schema: schemas.messageNotificationSchema,
      data: details.eventData,
    },
    contexts: details.contexts,
  });
}

function removeGlobalContexts(): Promise<void> {
  return <Promise<void>>Promise.reject(new Error('Not implemented'));
}

function addGlobalContexts(): Promise<void> {
  return <Promise<void>>Promise.reject(new Error('Not implemented'));
}

function setUserId(details: {
  tracker: string;
  userId: string | null;
}): Promise<void> {
  trackers[details.tracker]?.setUserId(details.userId ?? '');
  return <Promise<void>>Promise.resolve();
}

function setNetworkUserId(details: {
  tracker: string;
  networkUserId: string | null;
}): Promise<void> {
  trackers[details.tracker]?.setNetworkUserId(details.networkUserId ?? '');
  return <Promise<void>>Promise.resolve();
}

function setDomainUserId(details: {
  tracker: string;
  domainUserId: string | null;
}): Promise<void> {
  trackers[details.tracker]?.setDomainUserId(details.domainUserId ?? '');
  return <Promise<void>>Promise.resolve();
}

function setIpAddress(details: {
  tracker: string;
  ipAddress: string | null;
}): Promise<void> {
  trackers[details.tracker]?.setIpAddress(details.ipAddress ?? '');
  return <Promise<void>>Promise.resolve();
}

function setUseragent(details: {
  tracker: string;
  useragent: string | null;
}): Promise<void> {
  trackers[details.tracker]?.setUseragent(details.useragent ?? '');
  return <Promise<void>>Promise.resolve();
}

function setTimezone(details: {
  tracker: string;
  timezone: string | null;
}): Promise<void> {
  trackers[details.tracker]?.setTimezone(details.timezone ?? '');
  return <Promise<void>>Promise.resolve();
}

function setLanguage(details: {
  tracker: string;
  language: string | null;
}): Promise<void> {
  trackers[details.tracker]?.setLang(details.language ?? '');
  return <Promise<void>>Promise.resolve();
}

function setScreenResolution(details: {
  tracker: string;
  screenResolution: ScreenSize | null;
}): Promise<void> {
  if (details.screenResolution) {
    trackers[details.tracker]?.setScreenResolution(
      String(details.screenResolution[0]),
      String(details.screenResolution[1])
    );
  } else {
    trackers[details.tracker]?.addPayloadPair('res', '');
  }
  return <Promise<void>>Promise.resolve();
}

function setScreenViewport(details: {
  tracker: string;
  screenViewport: ScreenSize | null;
}): Promise<void> {
  if (details.screenViewport) {
    trackers[details.tracker]?.setViewport(
      String(details.screenViewport[0]),
      String(details.screenViewport[1])
    );
  } else {
    trackers[details.tracker]?.addPayloadPair('vp', '');
  }
  return <Promise<void>>Promise.resolve();
}

function setColorDepth(details: {
  tracker: string;
  colorDepth: number | null;
}): Promise<void> {
  trackers[details.tracker]?.setColorDepth(String(details.colorDepth ?? ''));
  return <Promise<void>>Promise.resolve();
}

function getSessionUserId(): Promise<string> {
  return <Promise<string>>Promise.reject(new Error('Not implemented'));
}

function getSessionId(): Promise<string> {
  return <Promise<string>>Promise.reject(new Error('Not implemented'));
}

function getSessionIndex(): Promise<number> {
  return <Promise<number>>Promise.reject(new Error('Not implemented'));
}

function getIsInBackground(): Promise<boolean> {
  return <Promise<boolean>>Promise.reject(new Error('Not implemented'));
}

function getBackgroundIndex(): Promise<number> {
  return <Promise<number>>Promise.reject(new Error('Not implemented'));
}

function getForegroundIndex(): Promise<number> {
  return <Promise<number>>Promise.reject(new Error('Not implemented'));
}

const JSSnowplowTracker = Object.freeze({
  createTracker,
  removeTracker,
  removeAllTrackers,
  trackSelfDescribingEvent,
  trackStructuredEvent,
  trackScreenViewEvent,
  trackScrollChangedEvent,
  trackListItemViewEvent,
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
});

export { JSSnowplowTracker };
