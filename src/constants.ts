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

const logMessages = {
  // configuration errors
  namespace: 'namespace parameter is required to be set',
  endpoint: 'endpoint parameter is required to be set',
  network: 'networkConfig is invalid',
  tracker: 'trackerConfig is invalid',
  session: 'sessionConfig is invalid',
  emitter: 'emitterConfig is invalid',
  subject: 'subjectConfig is invalid',
  gdpr: 'gdprConfig is invalid',
  gc: 'gcConfig is invalid',

  // event errors
  context: 'invalid contexts parameter',
  selfDesc: 'selfDescribing event requires schema and data parameters to be set',
  evType: 'event argument can only be an object',
  screenViewReq: 'screenView event requires name as string parameter to be set',
  structuredReq: 'structured event requires category and action parameters to be set',
  pageviewReq: 'pageView event requires pageUrl parameter to be set',
  timingReq: 'timing event requires category, variable and timing parameters to be set',
  consentGReq: 'consentGranted event requires expiry, documentId and version parameters to be set',
  consentWReq: 'consentWithdrawn event requires all, documentId and version parameters to be set',
  ecomReq: 'ecommerceTransaction event requires orderId, totalValue to be set and items to be an array of valid ecommerceItems',
  deepLinkReq: 'deepLinkReceived event requires the url parameter to be set',
  messageNotificationReq: 'messageNotification event requires title, body, and trigger parameters to be set',

  // global contexts errors
  gcTagType: 'tag argument is required to be a string',
  gcType: 'global context argument is invalid',

  // api error prefix
  createTracker: 'createTracker:',
  removeTracker: 'removeTracker: trackerNamespace can only be a string',

  // methods
  trackSelfDesc: 'trackSelfDescribingEvent:',
  trackScreenView: 'trackScreenViewEvent:',
  trackStructured: 'trackStructuredEvent:',
  trackPageView: 'trackPageViewEvent:',
  trackTiming: 'trackTimingEvent:',
  trackConsentGranted: 'trackConsentGranted:',
  trackConsentWithdrawn: 'trackConsentWithdrawn:',
  trackEcommerceTransaction: 'trackEcommerceTransaction:',
  trackDeepLinkReceived: 'trackDeepLinkReceivedEvent:',
  trackMessageNotification: 'trackMessageNotificationEvent:',
  removeGlobalContexts: 'removeGlobalContexts:',
  addGlobalContexts: 'addGlobalContexts:',

  // setters
  setUserId: 'setUserId: userId can only be a string or null',
  setNetworkUserId: 'setNetworkUserId: networkUserId can only be a string(UUID) or null',
  setDomainUserId: 'setDomainUserId: domainUserId can only be a string(UUID) or null',
  setIpAddress: 'setIpAddress: ipAddress can only be a string or null',
  setUseragent: 'setUseragent: useragent can only be a string or null',
  setTimezone: 'setTimezone: timezone can only be a string or null',
  setLanguage: 'setLanguage: language can only be a string or null',
  setScreenResolution: 'setScreenResolution: screenResolution can only be of ScreenSize type or null',
  setScreenViewport: 'setScreenViewport: screenViewport can only be of ScreenSize type or null',
  setColorDepth: 'setColorDepth: colorDepth can only be a number(integer) or null',
  setSubjectData: 'setSubjectData:',
};

export {
  logMessages,
};
