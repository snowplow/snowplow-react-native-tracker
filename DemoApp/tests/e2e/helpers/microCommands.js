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

import * as Micro from './microHelpers.js';

const microUrl = '0.0.0.0';
const microPort = '9090';
const microGood = '/micro/good';
const microBad = '/micro/bad';
const microReset = '/micro/reset';

async function getMicroGood() {
  const good = await Micro.requestJson(microUrl, microPort, microGood);
  return good;
}

async function getMicroBad() {
  const bad = await Micro.requestJson(microUrl, microPort, microBad);
  return bad;
}

async function resetMicro() {
  await Micro.request(microUrl, microPort, microReset);
}

/**
 * setTimeout promise
 *
 * @param {number} millis The milliseconds to wait
 */
function sleep(millis) {
  return new Promise(resolve => {
    setTimeout(() => resolve('done sleeping!'), millis);
  });
}

/**
 * Asserts no bad events
 *
 */
function assertNoBadEvents() {
  return getMicroBad().then(res => {
    expect(res.length).toBe(0);
  });
}

/**
 * Asserts on the number of events having a given schema
 *
 * ```
 * eventsWithSchema("iglu:com.acme/test_event/jsonschema/1-0-0", 2);
 * ```
 *
 * @param {string} schema The event's schema to match
 * @param {number} [n=1] The expected number of matching events
 */
function eventsWithSchema(schema, n = 1) {
  n = parseInt(n, 10);
  return getMicroGood().then(arr => {
    const res = Micro.matchBySchema(arr, schema);
    expect(res.length).toBe(n);
  });
}

/**
 * Asserts on the number of events having a given type
 *
 * ```
 * eventsWithEventType("struct", 7);
 * ```
 *
 * @param {string} eventType The event's type to match
 * @param {number} [n=1] The expected number of matching events
 */
function eventsWithEventType(eventType, n = 1) {
  n = parseInt(n, 10);
  return getMicroGood().then(arr => {
    const res = Micro.matchByEventType(arr, eventType);
    expect(res.length).toBe(n);
  });
}

/**
 * Asserts on the number of events having a given set of properties (schema, values, contexts, parameters)
 *
 * ```
 * eventsWithProperties({
 *     schema: "iglu:com.acme/test_event/jsonschema/1-0-0",
 *     values: {
 *         testProperty: true
 *     },
 *     contexts: [{
 *         schema: "iglu:com.acme/test_context/jsonschema/1-0-0",
 *         data: {
 *             "testCoProp": 0,
 *         }
 *     }],
 *     parameters: {
 *         user_id: "tester",
 *         name_tracker: "myTrackerName"
 *     }
 * }, 3);
 * ```
 *
 * @param {Object} eventOptions The options to match against
 * @param {number} [n=1] The expected number of matching events
 */
function eventsWithProperties(eventOptions, n = 1) {
  n = parseInt(n, 10);
  return getMicroGood().then(arr => {
    const res = Micro.matchEvents(arr, eventOptions);
    expect(res.length).toBe(n);
  });
}

export {
  assertNoBadEvents,
  eventsWithSchema,
  eventsWithEventType,
  eventsWithProperties,
  resetMicro,
  sleep,
};
