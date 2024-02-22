const Micro = require('./microHelpers.js');

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
 *     header: "the: header"
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

/**
 * Asserts on the number of events having a given HTTP request header
 *
 * ```
 * eventsWithHeader("Connection: keep-alive", 2);
 * ```
 *
 * @param {string} header The request header to match
 * @param {number} [n=1] The expected number of matching events
 */
function eventsWithHeader(header, n = 1) {
  n = parseInt(n, 10);
  return getMicroGood().then(arr => {
    const res = Micro.matchByHeader(arr, header);
    expect(res.length).toBe(n);
  });
}

module.exports = {
  assertNoBadEvents,
  eventsWithSchema,
  eventsWithEventType,
  eventsWithProperties,
  eventsWithHeader,
  resetMicro,
  sleep,
};
