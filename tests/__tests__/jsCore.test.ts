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

import type { Payload } from '@snowplow/tracker-core';
import type { InitTrackerConfiguration } from '../../src/types';
import { JSSnowplowTracker } from '../../src/jsCore';

async function createTracker(
  configuration: InitTrackerConfiguration,
  callback?: () => Promise<void>
): Promise<Payload[]> {
  if (configuration.trackerConfig) {
    configuration.trackerConfig.base64Encoding = false;
  } else {
    configuration.trackerConfig = { base64Encoding: false };
  }

  const trackedPayloads: Payload[] = [];
  const emitter = (payload: Payload): void => {
    trackedPayloads.push(payload);
  };
  await JSSnowplowTracker.createTracker(configuration, emitter);
  if (callback) {
    await callback();
  }

  return trackedPayloads;
}
describe('test jsCore', () => {
  beforeEach(async () => {
    await JSSnowplowTracker.removeAllTrackers();
  });

  test('sets Subject properties and tracks structured event', async () => {
    const trackedPayloads = await createTracker(
      {
        namespace: 'ns',
        networkConfig: { endpoint: 'http://localhost' },
        subjectConfig: {
          userId: 'user1',
        },
      },
      async () => {
        await JSSnowplowTracker.trackStructuredEvent({
          tracker: 'ns',
          eventData: { category: 'cat', action: 'act' },
          contexts: [],
        });
      }
    );

    expect(trackedPayloads.length).toBe(1);
    expect(trackedPayloads[0]?.uid).toEqual('user1');
    expect(trackedPayloads[0]?.se_ca).toEqual('cat');
    expect(trackedPayloads[0]?.se_ac).toEqual('act');
  });

  test('tracks screen view event with default tracker', async () => {
    const trackedPayloads = await createTracker(
      {
        namespace: 'ns',
        networkConfig: { endpoint: 'http://localhost' },
      },
      async () => {
        await JSSnowplowTracker.trackScreenViewEvent({
          tracker: null,
          eventData: { id: 'id1', name: 'screen' },
          contexts: [],
        });
      }
    );

    expect(trackedPayloads.length).toBe(1);
    expect(trackedPayloads[0]?.tna).toEqual('ns');
    expect(trackedPayloads[0]?.ue_pr ?? '').toContain('"name":"screen"');
  });

  test('works with multiple trackers', async () => {
    const tracker1Payloads = await createTracker(
      {
        namespace: 'ns1',
        networkConfig: { endpoint: 'e1' },
      }
    );
    expect(tracker1Payloads.length).toBe(0);

    const tracker2Payloads = await createTracker(
      {
        namespace: 'ns2',
        networkConfig: { endpoint: 'e2' },
      },
      async () => {
        // track with default tracker
        await JSSnowplowTracker.trackPageViewEvent({
          tracker: null,
          eventData: { pageUrl: 'p1' },
          contexts: [],
        });
        // track with tracker 2
        await JSSnowplowTracker.trackPageViewEvent({
          tracker: 'ns2',
          eventData: { pageUrl: 'p2' },
          contexts: [],
        });
        // track with tracker 1
        await JSSnowplowTracker.trackPageViewEvent({
          tracker: 'ns1',
          eventData: { pageUrl: 'p3' },
          contexts: [],
        });
      }
    );

    expect(tracker1Payloads.length).toBe(2);
    expect(tracker2Payloads.length).toBe(1);
    expect(tracker2Payloads[0]?.url).toEqual('p2');
  });

  test('set user ID for initialized tracker', async () => {
    const payloads = await createTracker({
      namespace: 'ns1',
      networkConfig: { endpoint: 'e' },
      subjectConfig: { userId: 'shouldChange' },
    });
    await JSSnowplowTracker.setUserId({ tracker: 'ns1', userId: 'theUser' });
    await JSSnowplowTracker.trackDeepLinkReceivedEvent({
      tracker: 'ns1',
      eventData: { url: 'https://apple.com' },
      contexts: [],
    });

    expect(payloads.length).toBe(1);
    expect(payloads[0]?.uid).toEqual('theUser');
  });

  test('adds context entities to events', async () => {
    const payloads = await createTracker(
      { namespace: 'ns1', networkConfig: { endpoint: 'e' } },
      async () => {
        await JSSnowplowTracker.trackEcommerceTransactionEvent({
          tracker: null,
          eventData: {
            orderId: 'o1',
            totalValue: 10,
            items: [],
          },
          contexts: [
            {
              schema:
                'iglu:com.snowplowanalytics.snowplow/link_click/jsonschema/1-0-1',
              data: { targetUrl: 'http://a-target-url.com' },
            },
          ],
        });
      }
    );

    expect(payloads.length).toBe(1);
    expect(payloads[0]?.co).toContain('"targetUrl":"http://a-target-url.com"');
  });
});
