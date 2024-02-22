import type { Payload } from '@snowplow/tracker-core';
import type { InitTrackerConfiguration } from '../types';
import { JSSnowplowTracker } from '../jsCore';

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

  test('tracks scroll changed event with default tracker', async () => {
    const trackedPayloads = await createTracker(
      {
        namespace: 'ns',
        networkConfig: { endpoint: 'http://localhost' },
      },
      async () => {
        await JSSnowplowTracker.trackScrollChangedEvent({
          tracker: null,
          eventData: { viewHeight: 100, contentHeight: 200, yOffset: 50 },
          contexts: [],
        });
      }
    );

    expect(trackedPayloads.length).toBe(1);
    expect(trackedPayloads[0]?.tna).toEqual('ns');
    expect(trackedPayloads[0]?.ue_pr ?? '').toContain('"view_height":100');
    expect(trackedPayloads[0]?.ue_pr ?? '').toContain('"content_height":200');
    expect(trackedPayloads[0]?.ue_pr ?? '').toContain('"y_offset":50');
  });

  test('tracks list item view event with default tracker', async () => {
    const trackedPayloads = await createTracker(
      {
        namespace: 'ns',
        networkConfig: { endpoint: 'http://localhost' },
      },
      async () => {
        await JSSnowplowTracker.trackListItemViewEvent({
          tracker: null,
          eventData: { index: 2, itemsCount: 10 },
          contexts: [],
        });
      }
    );

    expect(trackedPayloads.length).toBe(1);
    expect(trackedPayloads[0]?.tna).toEqual('ns');
    expect(trackedPayloads[0]?.ue_pr ?? '').toContain('"index":2');
    expect(trackedPayloads[0]?.ue_pr ?? '').toContain('"items_count":10');
  });

  test('works with multiple trackers', async () => {
    const tracker1Payloads = await createTracker({
      namespace: 'ns1',
      networkConfig: { endpoint: 'e1' },
    });
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
