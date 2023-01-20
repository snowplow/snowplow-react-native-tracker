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

import type { Payload } from "@snowplow/tracker-core";
import type { InitTrackerConfiguration } from "../../src/types";
import { JSSnowplowTracker } from "../../src/jsCore";

describe("test jsCore", () => {
  beforeEach(() => {
    JSSnowplowTracker.removeAllTrackers();
  });

  test("sets Subject properties and tracks structured event", () => {
    let trackedPayloads = createTracker(
      {
        namespace: "ns",
        networkConfig: { endpoint: "http://localhost" },
        subjectConfig: {
          userId: "user1",
        },
      },
      () => {
        JSSnowplowTracker.trackStructuredEvent({
          tracker: "ns",
          eventData: { category: "cat", action: "act" },
          contexts: [],
        });
      }
    );

    expect(trackedPayloads.length).toBe(1);
    expect(trackedPayloads[0]?.uid).toEqual("user1");
    expect(trackedPayloads[0]?.se_ca).toEqual("cat");
    expect(trackedPayloads[0]?.se_ac).toEqual("act");
  });

  test("tracks screen view event with default tracker", () => {
    let trackedPayloads = createTracker(
      {
        namespace: "ns",
        networkConfig: { endpoint: "http://localhost" },
      },
      () => {
        JSSnowplowTracker.trackScreenViewEvent({
          tracker: null,
          eventData: { id: "id1", name: "screen" },
          contexts: [],
        });
      }
    );

    expect(trackedPayloads.length).toBe(1);
    expect(trackedPayloads[0]?.tna).toEqual("ns");
    expect(trackedPayloads[0]?.ue_pr ?? "").toContain('"name":"screen"');
  });

  test("works with multiple trackers", () => {
    let tracker1Payloads = createTracker(
      {
        namespace: "ns1",
        networkConfig: { endpoint: "e1" },
      },
      () => {}
    );
    expect(tracker1Payloads.length).toBe(0);

    let tracker2Payloads = createTracker(
      {
        namespace: "ns2",
        networkConfig: { endpoint: "e2" },
      },
      () => {
        // track with default tracker
        JSSnowplowTracker.trackPageViewEvent({
          tracker: null,
          eventData: { pageUrl: "p1" },
          contexts: [],
        });
        // track with tracker 2
        JSSnowplowTracker.trackPageViewEvent({
          tracker: "ns2",
          eventData: { pageUrl: "p2" },
          contexts: [],
        });
        // track with tracker 1
        JSSnowplowTracker.trackPageViewEvent({
          tracker: "ns1",
          eventData: { pageUrl: "p3" },
          contexts: [],
        });
      }
    );

    expect(tracker1Payloads.length).toBe(2);
    expect(tracker2Payloads.length).toBe(1);
    expect(tracker2Payloads[0]?.url).toEqual("p2");
  });

  test("set user ID for initialized tracker", () => {
    let payloads = createTracker({
      namespace: "ns1",
      networkConfig: { endpoint: "e" },
      subjectConfig: { userId: "shouldChange" },
    });
    JSSnowplowTracker.setUserId({ tracker: "ns1", userId: "theUser" });
    JSSnowplowTracker.trackDeepLinkReceivedEvent({
      tracker: "ns1",
      eventData: { url: "https://apple.com" },
      contexts: [],
    });

    expect(payloads.length).toBe(1);
    expect(payloads[0]?.uid).toEqual("theUser");
  });

  test("adds context entities to events", () => {
    let payloads = createTracker(
      { namespace: "ns1", networkConfig: { endpoint: "e" } },
      () => {
        JSSnowplowTracker.trackEcommerceTransactionEvent({
          tracker: null,
          eventData: {
            orderId: "o1",
            totalValue: 10,
            items: [],
          },
          contexts: [
            {
              schema:
                "iglu:com.snowplowanalytics.snowplow/link_click/jsonschema/1-0-1",
              data: { targetUrl: "http://a-target-url.com" },
            },
          ],
        });
      }
    );

    expect(payloads.length).toBe(1);
    expect(payloads[0]?.co).toContain('"targetUrl":"http://a-target-url.com"')
  });
});

function createTracker(
  configuration: InitTrackerConfiguration,
  callback?: () => void
) {
  if (configuration.trackerConfig) {
    configuration.trackerConfig.base64Encoding = false;
  } else {
    configuration.trackerConfig = { base64Encoding: false };
  }

  let trackedPayloads: Payload[] = [];
  let emitter = {
    input: (payload: Payload) => {
      trackedPayloads.push(payload);
    },
  };
  JSSnowplowTracker.createTracker(configuration, emitter);
  if (callback) {
    callback();
  }

  return trackedPayloads;
}
