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

const commands = require('./helpers/microCommands.js');
const schemas = require('./helpers/schemas.js');

test('no bad events', async () => {
  await commands.assertNoBadEvents();
});

test('number of screen_view events', async () => {
  await commands.eventsWithSchema(schemas.screenView, 8);
});

test('number of structured events', async () => {
  await commands.eventsWithEventType('struct', 5);
});

test('number of page_view events', async () => {
  await commands.eventsWithEventType('page_view', 4);
});

test('screen_view with adImpression context', async () => {
  await commands.eventsWithProperties(
    {
      schema: schemas.screenView,
      values: {
        name: 'withContext and screenId',
      },
      contexts: [
        {
          schema: schemas.adImpression,
          data: {
            impressionId: 'test_imp_id',
          },
        },
      ],
    },
    1,
  );
});

test('self-describing ad_impression event', async () => {
  await commands.eventsWithProperties(
    {
      schema: schemas.linkClick,
      values: {
        targetUrl: 'test.test',
      },
      contexts: [
        {schema: schemas.mobileApplicationContext},
        {schema: schemas.mobileContext},
        {schema: schemas.mobileScreenContext},
        {schema: schemas.clientSessionContext},
        {schema: schemas.gdprContext},
      ],
    },
    1,
  );
});

test('consentWithdrawn event', async () => {
  await commands.eventsWithProperties(
    {
      schema: schemas.consentWithdrawn,
      values: {
        all: true,
      },
      contexts: [
        {
          schema: schemas.consentDoc,
          data: {
            id: '0987',
            version: '0.2.0',
          },
        },
      ],
    },
    1,
  );
});

test('consentGranted event', async () => {
  await commands.eventsWithProperties(
    {
      schema: schemas.consentGranted,
      values: {
        expiry: '2022-01-01T00:00:00Z',
      },
      contexts: [
        {
          schema: schemas.consentDoc,
          data: {
            id: '0123',
            version: '0.1.0',
          },
        },
      ],
    },
    1,
  );
});

test('timing event', async () => {
  await commands.eventsWithProperties(
    {
      schema: schemas.timing,
      values: {
        variable: 'testTimingVariable',
        category: 'testTimingCategory',
        timing: 10,
      },
    },
    1,
  );
});

test('transaction item event', async () => {
  await commands.eventsWithProperties(
    {
      parameters: {
        event: 'transaction_item',
        ti_orderid: '0000',
        ti_sku: '123',
        ti_price: 5,
        ti_quantity: 2,
      },
    },
    1,
  );
});

test('ecommerce transaction event', async () => {
  await commands.eventsWithProperties(
    {
      parameters: {
        event: 'transaction',
        tr_orderid: '0000',
        tr_total: 10,
      },
    },
    1,
  );
});

test('deep link event', async () => {
  await commands.eventsWithProperties(
    {
      schema: schemas.deepLink,
      values: {
        url: 'https://deeplink.com',
        referrer: 'http://refr.com',
      },
    },
    1,
  );
});

test('message notification event', async () => {
  await commands.eventsWithProperties(
    {
      schema: schemas.messageNotification,
      values: {
        title: 'title1',
        body: 'body1',
        trigger: 'push',
        action: 'action1',
        attachments: [
          {
            identifier: 'att_id1',
            type: 'att_type1',
            url: 'http://att.url.1',
          },
        ],
        bodyLocArgs: ['bodyArg1', 'bodyArg2'],
        bodyLocKey: 'bodyKey1',
        category: 'category1',
        contentAvailable: true,
        group: 'group1',
        icon: 'icon1',
        notificationCount: 3,
        notificationTimestamp: '2022-02-02T15:17:42.767Z',
        sound: 'sound1',
        subtitle: 'subtitle1',
        tag: 'tag1',
        threadIdentifier: 'threadIdentifier1',
        titleLocArgs: ['titleArg1', 'titleArg2'],
        titleLocKey: 'titleKey1',
      },
    },
    1,
  );
});

test('common in all first tracker events', async () => {
  await commands.eventsWithProperties(
    {
      parameters: {
        app_id: 'DemoAppId',
        platform: 'iot',
        name_tracker: 'sp1',
      },
      contexts: [
        {schema: schemas.mobileApplicationContext},
        {schema: schemas.mobileContext},
        {schema: schemas.mobileScreenContext},
        {schema: schemas.clientSessionContext},
        {
          schema: schemas.gdprContext,
          data: {
            basisForProcessing: 'consent',
            documentDescription: 'test gdpr document',
            documentId: 'docId',
            documentVersion: '0.0.1',
          },
        },
        {
          schema: schemas.adImpression,
          data: {impressionId: 'test_global_contexts_0'},
        },
        {
          schema: schemas.adImpression,
          data: {impressionId: 'test_global_contexts_1'},
        },
      ],
    },
    23,
  );
});

test('events after resetting the Subject', async () => {
  await commands.eventsWithProperties(
    {
      parameters: {
        user_id: 'nextTester',
        dvce_screenwidth: 300,
        dvce_screenheight: 300,
        br_lang: 'es',
        os_timezone: 'Europe/London',
      },
      schema: schemas.screenView,
      values: {
        name: 'afterSetSubjectTestSV',
      },
    },
    1,
  );
});

test('second tracker events', async () => {
  await commands.eventsWithProperties(
    {
      parameters: {
        name_tracker: 'sp2',
      },
      contexts: [
        {schema: schemas.mobileApplicationContext},
        {schema: schemas.mobileContext},
        {schema: schemas.mobileScreenContext},
        {schema: schemas.clientSessionContext},
      ],
    },
    2,
  );
});
