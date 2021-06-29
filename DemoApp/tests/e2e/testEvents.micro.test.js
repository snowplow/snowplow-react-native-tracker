/*
 * Copyright (c) 2020-2021 Snowplow Analytics Ltd. All rights reserved.
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

test('application_install event', async () => {
  await commands.eventsWithSchema(schemas.appInstall, 1);
});

test('number of screen_view events', async () => {
  await commands.eventsWithSchema(schemas.screenView, 7);
});

test('number of structured events', async () => {
  await commands.eventsWithEventType('struct', 4);
});

test('number of page_view events', async () => {
  await commands.eventsWithEventType('page_view', 8);
});

test('self-describing ad_impression event', async () => {
  await commands.eventsWithProperties(
    {
      schema: schemas.adImpression,
      values: {
        impressionId: 'test_imp_id',
      },
      contexts: [
        {schema: schemas.mobileApplicationContext},
        {schema: schemas.mobileContext},
        {schema: schemas.mobileScreenContext},
        {schema: schemas.clientSessionContext},
      ],
    },
    1,
  );
});

test('contexts in all screen_view events', async () => {
  await commands.eventsWithProperties(
    {
      schema: schemas.screenView,
      contexts: [
        {schema: schemas.mobileApplicationContext},
        {schema: schemas.mobileContext},
        {schema: schemas.mobileScreenContext},
        {schema: schemas.clientSessionContext},
      ],
    },
    7,
  );
});

test('contexts in all struct events', async () => {
  await commands.eventsWithProperties(
    {
      parameters: {
        event: 'struct',
      },
      contexts: [
        {schema: schemas.mobileApplicationContext},
        {schema: schemas.mobileContext},
        {schema: schemas.mobileScreenContext},
        {schema: schemas.clientSessionContext},
      ],
    },
    4,
  );
});

test('screen_view with gdpr context', async () => {
  await commands.eventsWithProperties(
    {
      schema: schemas.screenView,
      values: {
        name: 'withAContext',
        previousName: 'allOptionalsUndefined',
      },
      contexts: [
        {
          schema: schemas.gdprContext,
          data: {
            basisForProcessing: 'consent',
          },
        },
      ],
    },
    1,
  );
});

test('pv events before resetting the Subject', async () => {
  await commands.eventsWithProperties(
    {
      parameters: {
        event: 'page_view',
        user_id: 'test-userId-0',
        os_timezone: 'Europe/London',
        br_lang: 'fr',
        user_ipaddress: '123.45.67.89',
        useragent: 'some-user-agent-string',
        network_userid: '5d79770b-015b-4af8-8c91-b2ed6faf4b1e',
        domain_userid: '5d79770b-015b-4af8-8c91-b2ed6faf4b1e',
        dvce_screenwidth: 123,
        dvce_screenheight: 456,
        br_colordepth: '20',
        br_viewwidth: 123,
        br_viewheight: 456,
      },
      contexts: [
        {schema: schemas.mobileApplicationContext},
        {schema: schemas.mobileContext},
        {schema: schemas.mobileScreenContext},
        {schema: schemas.clientSessionContext},
      ],
    },
    4,
  );
});

test('events after resetting the Subject', async () => {
  await commands.eventsWithProperties(
    {
      parameters: {
        event: 'page_view',
        user_id: 'test-userId-1',
        os_timezone: null,
        br_lang: null,
        domain_userid: null,
        dvce_screenwidth: 456,
        dvce_screenheight: 789,
        br_colordepth: '20',
        br_viewwidth: 456,
        br_viewheight: 789,
      },
      contexts: [
        {schema: schemas.mobileApplicationContext},
        {schema: schemas.mobileContext},
        {schema: schemas.mobileScreenContext},
        {schema: schemas.clientSessionContext},
      ],
    },
    4,
  );
});
