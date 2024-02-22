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
  selfDesc:
    'selfDescribing event requires schema and data parameters to be set',
  evType: 'event argument can only be an object',
  screenViewReq: 'screenView event requires name as string parameter to be set',
  listItemViewReq:
    'listItemView event requires index asn integer parameter to be set',
  structuredReq:
    'structured event requires category and action parameters to be set',
  pageviewReq: 'pageView event requires pageUrl parameter to be set',
  timingReq:
    'timing event requires category, variable and timing parameters to be set',
  consentGReq:
    'consentGranted event requires expiry, documentId and version parameters to be set',
  consentWReq:
    'consentWithdrawn event requires all, documentId and version parameters to be set',
  ecomReq:
    'ecommerceTransaction event requires orderId, totalValue to be set and items to be an array of valid ecommerceItems',
  deepLinkReq: 'deepLinkReceived event requires the url parameter to be set',
  messageNotificationReq:
    'messageNotification event requires title, body, and trigger parameters to be set',

  // global contexts errors
  gcTagType: 'tag argument is required to be a string',
  gcType: 'global context argument is invalid',

  // api error prefix
  createTracker: 'createTracker:',
  removeTracker: 'removeTracker: trackerNamespace can only be a string',

  // methods
  trackSelfDesc: 'trackSelfDescribingEvent:',
  trackScreenView: 'trackScreenViewEvent:',
  trackScrollChanged: 'trackScrollChangedEvent:',
  trackListItemView: 'trackListItemViewEvent:',
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
  setNetworkUserId:
    'setNetworkUserId: networkUserId can only be a string(UUID) or null',
  setDomainUserId:
    'setDomainUserId: domainUserId can only be a string(UUID) or null',
  setIpAddress: 'setIpAddress: ipAddress can only be a string or null',
  setUseragent: 'setUseragent: useragent can only be a string or null',
  setTimezone: 'setTimezone: timezone can only be a string or null',
  setLanguage: 'setLanguage: language can only be a string or null',
  setScreenResolution:
    'setScreenResolution: screenResolution can only be of ScreenSize type or null',
  setScreenViewport:
    'setScreenViewport: screenViewport can only be of ScreenSize type or null',
  setColorDepth:
    'setColorDepth: colorDepth can only be a number(integer) or null',
  setSubjectData: 'setSubjectData:',
};

const schemas = {
  payloadData:
    'iglu:com.snowplowanalytics.snowplow/payload_data/jsonschema/1-0-4',
  timingSchema: 'iglu:com.snowplowanalytics.snowplow/timing/jsonschema/1-0-0',
  deepLinkReceivedSchema:
    'iglu:com.snowplowanalytics.mobile/deep_link_received/jsonschema/1-0-0',
  messageNotificationSchema:
    'iglu:com.snowplowanalytics.mobile/message_notification/jsonschema/1-0-0',
  screenViewSchema:
    'iglu:com.snowplowanalytics.mobile/screen_view/jsonschema/1-0-0',
  scrollChangedSchema:
    'iglu:com.snowplowanalytics.mobile/scroll_changed/jsonschema/1-0-0',
  listItemViewSchema:
    'iglu:com.snowplowanalytics.mobile/list_item_view/jsonschema/1-0-0',
};

export { logMessages, schemas };
