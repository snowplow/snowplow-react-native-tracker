'use strict';

import { RNSnowplowTracker } from './native';
import { logMessages } from './constants';
import {
  validateContexts,
  validateSelfDesc,
  validateScreenView,
  validateScrollChanged,
  validateListItemView,
  validateStructured,
  validatePageView,
  validateTiming,
  validateConsentGranted,
  validateConsentWithdrawn,
  validateEcommerceTransaction,
  validateDeepLinkReceived,
  validateMessageNotification,
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
  ScrollChangedProps,
  ListItemViewProps,
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
  namespace: string | null,
  argmap: SelfDescribing,
  contexts: EventContext[] = []
): Promise<void> {
  return <Promise<void>>validateSelfDesc(argmap)
    .then(() => validateContexts(contexts))
    .then(
      () => <Promise<void>>RNSnowplowTracker.trackSelfDescribingEvent({
          tracker: namespace,
          eventData: argmap,
          contexts: contexts,
        })
    )
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
  namespace: string | null,
  argmap: ScreenViewProps,
  contexts: EventContext[] = []
): Promise<void> {
  return <Promise<void>>validateScreenView(argmap)
    .then(() => validateContexts(contexts))
    .then(
      () => <Promise<void>>RNSnowplowTracker.trackScreenViewEvent({
          tracker: namespace,
          eventData: argmap,
          contexts: contexts,
        })
    )
    .catch((error) => {
      throw new Error(`${logMessages.trackScreenView} ${error.message}`);
    });
}

/**
 * Tracks a scroll-changed event
 *
 * @param namespace {string} - the tracker namespace
 * @param argmap {Object} - the event data
 * @param contexts {Array}- the event contexts
 * @returns {Promise}
 */
function trackScrollChangedEvent(
  namespace: string | null,
  argmap: ScrollChangedProps,
  contexts: EventContext[] = []
): Promise<void> {
  return <Promise<void>>validateScrollChanged(argmap)
    .then(() => validateContexts(contexts))
    .then(
      () => <Promise<void>>RNSnowplowTracker.trackScrollChangedEvent({
          tracker: namespace,
          eventData: argmap,
          contexts: contexts,
        })
    )
    .catch((error) => {
      throw new Error(`${logMessages.trackScrollChanged} ${error.message}`);
    });
}

/**
 * Tracks a list item view event
 *
 * @param namespace {string} - the tracker namespace
 * @param argmap {Object} - the event data
 * @param contexts {Array}- the event contexts
 * @returns {Promise}
 */
function trackListItemViewEvent(
  namespace: string | null,
  argmap: ListItemViewProps,
  contexts: EventContext[] = []
): Promise<void> {
  return <Promise<void>>validateListItemView(argmap)
    .then(() => validateContexts(contexts))
    .then(
      () => <Promise<void>>RNSnowplowTracker.trackListItemViewEvent({
          tracker: namespace,
          eventData: argmap,
          contexts: contexts,
        })
    )
    .catch((error) => {
      throw new Error(`${logMessages.trackListItemView} ${error.message}`);
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
  namespace: string | null,
  argmap: StructuredProps,
  contexts: EventContext[] = []
): Promise<void> {
  return <Promise<void>>validateStructured(argmap)
    .then(() => validateContexts(contexts))
    .then(
      () => <Promise<void>>RNSnowplowTracker.trackStructuredEvent({
          tracker: namespace,
          eventData: argmap,
          contexts: contexts,
        })
    )
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
  namespace: string | null,
  argmap: PageViewProps,
  contexts: EventContext[] = []
): Promise<void> {
  return <Promise<void>>validatePageView(argmap)
    .then(() => validateContexts(contexts))
    .then(
      () => <Promise<void>>RNSnowplowTracker.trackPageViewEvent({
          tracker: namespace,
          eventData: argmap,
          contexts: contexts,
        })
    )
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
  namespace: string | null,
  argmap: TimingProps,
  contexts: EventContext[] = []
): Promise<void> {
  return <Promise<void>>validateTiming(argmap)
    .then(() => validateContexts(contexts))
    .then(
      () => <Promise<void>>RNSnowplowTracker.trackTimingEvent({
          tracker: namespace,
          eventData: argmap,
          contexts: contexts,
        })
    )
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
  namespace: string | null,
  argmap: ConsentGrantedProps,
  contexts: EventContext[] = []
): Promise<void> {
  return <Promise<void>>validateConsentGranted(argmap)
    .then(() => validateContexts(contexts))
    .then(
      () => <Promise<void>>RNSnowplowTracker.trackConsentGrantedEvent({
          tracker: namespace,
          eventData: argmap,
          contexts: contexts,
        })
    )
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
  namespace: string | null,
  argmap: ConsentWithdrawnProps,
  contexts: EventContext[] = []
): Promise<void> {
  return <Promise<void>>validateConsentWithdrawn(argmap)
    .then(() => validateContexts(contexts))
    .then(
      () => <Promise<void>>RNSnowplowTracker.trackConsentWithdrawnEvent({
          tracker: namespace,
          eventData: argmap,
          contexts: contexts,
        })
    )
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
  namespace: string | null,
  argmap: EcommerceTransactionProps,
  contexts: EventContext[] = []
): Promise<void> {
  return <Promise<void>>validateEcommerceTransaction(argmap)
    .then(() => validateContexts(contexts))
    .then(
      () => <Promise<void>>RNSnowplowTracker.trackEcommerceTransactionEvent({
          tracker: namespace,
          eventData: argmap,
          contexts: contexts,
        })
    )
    .catch((error) => {
      throw new Error(
        `${logMessages.trackEcommerceTransaction} ${error.message}`
      );
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
  namespace: string | null,
  argmap: DeepLinkReceivedProps,
  contexts: EventContext[] = []
): Promise<void> {
  return <Promise<void>>validateDeepLinkReceived(argmap)
    .then(() => validateContexts(contexts))
    .then(
      () => <Promise<void>>RNSnowplowTracker.trackDeepLinkReceivedEvent({
          tracker: namespace,
          eventData: argmap,
          contexts: contexts,
        })
    )
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
  namespace: string | null,
  argmap: MessageNotificationProps,
  contexts: EventContext[] = []
): Promise<void> {
  return <Promise<void>>validateMessageNotification(argmap)
    .then(() => validateContexts(contexts))
    .then(
      () => <Promise<void>>RNSnowplowTracker.trackMessageNotificationEvent({
          tracker: namespace,
          eventData: argmap,
          contexts: contexts,
        })
    )
    .catch((error) => {
      throw new Error(
        `${logMessages.trackMessageNotification} ${error.message}`
      );
    });
}

export {
  trackSelfDescribingEvent,
  trackScreenViewEvent,
  trackScrollChangedEvent,
  trackListItemViewEvent,
  trackStructuredEvent,
  trackPageViewEvent,
  trackTimingEvent,
  trackConsentGrantedEvent,
  trackConsentWithdrawnEvent,
  trackEcommerceTransactionEvent,
  trackDeepLinkReceivedEvent,
  trackMessageNotificationEvent,
};
