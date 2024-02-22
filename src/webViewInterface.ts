'use strict';

import {
  trackPageViewEvent,
  trackScreenViewEvent,
  trackSelfDescribingEvent,
  trackStructuredEvent,
} from './tracker';
import type {
  ScreenViewProps,
  SelfDescribing,
  StructuredProps,
  WebViewPageViewEvent,
  WebViewMessage,
} from './types';
import { errorHandler } from './utils';

function forEachTracker(
  trackers: Array<string> | undefined,
  iterator: (namespace: string | null) => void
): void {
  if (trackers && trackers.length > 0) {
    trackers.forEach(iterator);
  } else {
    iterator(null);
  }
}

/**
 * Enables tracking events from apps rendered in react-native-webview components.
 * The apps need to use the Snowplow WebView tracker to track the events.
 *
 * To subscribe for the events, set the `onMessage` attribute:
 * <WebView onMessage={getWebViewCallback()} ... />
 *
 * @returns Callback to subscribe for events from Web views tracked using the Snowplow WebView tracker.
 */
export function getWebViewCallback() {
  return (message: { nativeEvent: { data: string } }): void => {
    const data = JSON.parse(message.nativeEvent.data) as WebViewMessage;
    switch (data.command) {
      case 'trackSelfDescribingEvent':
        forEachTracker(data.trackers, (namespace) => {
          trackSelfDescribingEvent(
            namespace,
            data.event as SelfDescribing,
            data.context || []
          ).catch((error) => {
            errorHandler(error);
          });
        });
        break;

      case 'trackStructEvent':
        forEachTracker(data.trackers, (namespace) => {
          trackStructuredEvent(
            namespace,
            data.event as StructuredProps,
            data.context || []
          ).catch((error) => {
            errorHandler(error);
          });
        });
        break;

      case 'trackPageView':
        forEachTracker(data.trackers, (namespace) => {
          const event = data.event as WebViewPageViewEvent;
          trackPageViewEvent(namespace, {
            pageTitle: event.title ?? '',
            pageUrl: event.url ?? '',
            referrer: event.referrer,
          }).catch((error) => {
            errorHandler(error);
          });
        });
        break;

      case 'trackScreenView':
        forEachTracker(data.trackers, (namespace) => {
          trackScreenViewEvent(
            namespace,
            data.event as ScreenViewProps,
            data.context || []
          ).catch((error) => {
            errorHandler(error);
          });
        });
        break;
    }
  };
}
