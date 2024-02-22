// Self-describing schemas
const appInstall =
  'iglu:com.snowplowanalytics.mobile/application_install/jsonschema/1-0-0';
const screenView =
  'iglu:com.snowplowanalytics.mobile/screen_view/jsonschema/1-0-0';
const adImpression =
  'iglu:com.snowplowanalytics.snowplow/ad_impression/jsonschema/1-0-0';
const linkClick =
  'iglu:com.snowplowanalytics.snowplow/link_click/jsonschema/1-0-1';
const consentWithdrawn =
  'iglu:com.snowplowanalytics.snowplow/consent_withdrawn/jsonschema/1-0-0';
const consentGranted =
  'iglu:com.snowplowanalytics.snowplow/consent_granted/jsonschema/1-0-0';
const consentDoc =
  'iglu:com.snowplowanalytics.snowplow/consent_document/jsonschema/1-0-0';
const timing = 'iglu:com.snowplowanalytics.snowplow/timing/jsonschema/1-0-0';
const deepLink =
  'iglu:com.snowplowanalytics.mobile/deep_link_received/jsonschema/1-0-0';
const messageNotification =
  'iglu:com.snowplowanalytics.mobile/message_notification/jsonschema/1-0-0';

// Context schemas
const mobileApplicationContext =
  'iglu:com.snowplowanalytics.mobile/application/jsonschema/1-0-0';
const mobileContext =
  'iglu:com.snowplowanalytics.snowplow/mobile_context/jsonschema/1-0-3';
const mobileScreenContext =
  'iglu:com.snowplowanalytics.mobile/screen/jsonschema/1-0-0';
const clientSessionContext =
  'iglu:com.snowplowanalytics.snowplow/client_session/jsonschema/1-0-2';
const gdprContext = 'iglu:com.snowplowanalytics.snowplow/gdpr/jsonschema/1-0-0';

module.exports = {
  appInstall,
  screenView,
  adImpression,
  linkClick,
  consentWithdrawn,
  consentGranted,
  consentDoc,
  timing,
  mobileApplicationContext,
  mobileContext,
  mobileScreenContext,
  clientSessionContext,
  gdprContext,
  deepLink,
  messageNotification,
};
