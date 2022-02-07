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

const http = require('http');

/**
 * Makes an http get request
 *
 * @param {string} url
 * @param {string} port
 * @param {string} path
 */
function request(url, port, path) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: url,
      port: port,
      path: path,
    };
    try {
      http.get(options, res => {
        let data = '';
        res.on('data', d => (data += d));
        res.on('end', () => resolve(data));
      });
    } catch (e) {
      reject(e);
    }
  });
}

/**
 * Returns a JSON parsed response from an http request
 *
 * @param {string} url
 * @param {string} port
 * @param {string} path
 */
function requestJson(url, port, path) {
  return request(url, port, path).then(g => JSON.parse(g));
}

/**
 * Filters an array of Snowplow events based on eventType
 *
 * ```
 * matchByEventType(goodEventsArray, "page_view");
 *
 * ```
 * @param {Array} eventsArray An array of Snowplow events
 * @param {string} eventType The eventType to match
 * @returns {Array} An array with the matching events
 */
function matchByEventType(eventsArray, eventType) {
  return eventsArray.filter(hasEventType(eventType));
}

/**
 * Filters an array of Snowplow events based on schema
 *
 * ```
 * matchBySchema(goodEventsArray, "iglu:com.acme/test_event/jsonschema/1-0-0");
 * ```
 *
 * @param {Array} eventsArray An array of Snowplow events
 * @param {string} schema The schema to match
 * @returns {Array} An array with the matching events
 */
function matchBySchema(eventsArray, schema) {
  return eventsArray.filter(hasSchema(schema));
}

/**
 * Filters an array of unstructured Snowplow events based on data values
 *
 * ```
 * matchByVals(goodEventsArray, {targetUrl: "https://docs.snowplowanalytics.com/"});
 * ```
 *
 * @param {Array} eventsArray An array of unstructured Snowplow events
 * @param {Object} valsObj The object having as keys the data fields to match
 * @returns {Array} An array with the matching events
 */
function matchByVals(eventsArray, valsObj) {
  return eventsArray.filter(hasValues(valsObj));
}

/**
 * Filters an array of Snowplow events based on parameter values
 *
 * ```
 * matchByParams(goodEventsArray,
 *               {
 *                   event: "struct",
 *                   se_category: "Mixes",
 *                   se_action: "Play",
 *               });
 * ```
 *
 * @param {Array} eventsArray An array of Snowplow events
 * @param {Object} paramsObj An object having as keys the event parameters to match
 * @returns {Array} An array with the matching events
 */
function matchByParams(eventsArray, paramsObj) {
  return eventsArray.filter(hasParams(paramsObj));
}

/**
 * Filters an array of Snowplow events based on an array of attached contexts
 *
 * ```
 * matchByContexts(goodEventsArray,
 *                 [{
 *                     schema: "iglu:com.acme/a_test_context/jsonschema/1-0-0",
 *                     data: {"testprop": 0}
 *                 },{
 *                     schema: "iglu:com.acme/b_test_context/jsonschema/1-0-0"
 *                 }]);
 * ```
 *
 * @param {Array} eventsArray An array of Snowplow events
 * @param {Array} expectedContextsArray An array of contexts
 * @returns {Array} An array with the matching events
 */
function matchByContexts(eventsArray, expectedContextsArray) {
  return eventsArray.filter(hasContexts(expectedContextsArray));
}

/**
 * Filters an array of Snowplow events based on event's Properties
 *
 * ```
 * matchEvents(goodEventsArray,
 *             {
 *                 schema: "iglu:com.acme/test_event/jsonschema/1-0-0",
 *                 values: {
 *                     testProperty: true
 *                 },
 *                 contexts: [{
 *                     schema: "iglu:com.acme/test_context/jsonschema/1-0-0",
 *                     data: {
 *                         testCoProp: 0,
 *                     }
 *                 }],
 *                 parameters: {
 *                     user_id: "tester",
 *                     name_tracker: "myTrackerName"
 *                 }
 *             });
 * ```
 *
 * @param {Array} microEvents An array of Snowplow events
 * @param {Properties} eventProps The event properties to match against
 * @returns {Array} An array with the matching events
 */
function matchEvents(microEvents, eventProps) {
  if (Object.prototype.toString.call(microEvents) !== '[object Array]') {
    microEvents = [microEvents];
  }

  let res = microEvents;

  if (eventProps.eventType) {
    res = matchByEventType(res, eventProps.eventType);
  }

  if (eventProps.schema) {
    res = matchBySchema(res, eventProps.schema);
  }

  if (eventProps.values) {
    res = matchByVals(res, eventProps.values);
  }

  if (eventProps.contexts) {
    res = matchByContexts(res, eventProps.contexts);
  }

  if (eventProps.parameters) {
    res = matchByParams(res, eventProps.parameters);
  }

  return res;
}

function hasEventType(evType) {
  return function (ev) {
    return ev.eventType === evType;
  };
}

function hasSchema(schema) {
  return function (ev) {
    if (ev.eventType === 'unstruct') {
      let unstruct_ev = ev.event.unstruct_event;

      return unstruct_ev.data.schema === schema;
    } else {
      return false;
    }
  };
}

function hasValues(values) {
  return function (ev) {
    if (ev.eventType === 'unstruct') {
      let unstruct_ev = ev.event.unstruct_event;
      let data = unstruct_ev.data.data;

      return (
        Object.keys(values).every(keyIncludedIn(data)) &&
        Object.keys(values).every(comparesIn(values, data))
      );
    } else {
      return false;
    }
  };
}

function hasParams(expectParams) {
  return function (ev) {
    let actualParams = ev.event;

    return (
      Object.keys(expectParams).every(keyIncludedIn(actualParams)) &&
      Object.keys(expectParams).every(comparesIn(expectParams, actualParams))
    );
  };
}

function hasContexts(expCoArr) {
  return function (ev) {
    let evCo = ev.event.contexts;

    if (evCo.hasOwnProperty('data')) {
      let actCoArr = evCo.data;

      return compare(expCoArr, actCoArr);
    } else {
      return false;
    }
  };
}

function keyIncludedIn(obj) {
  return function (key) {
    return Object.keys(obj).includes(key);
  };
}

function comparesIn(expected, actual) {
  return function (key) {
    let expValue = expected[key];
    let actValue = actual[key];

    return compare(expValue, actValue);
  };
}

/**
 * A function to deep compare (equality for primitive data types and containership for Objects and Arrays)
 *
 * ```
 * compare(1, 1);  // true
 * compare(1, "1");  // false
 * compare([1, 2], [3, 1, 2]);  // true
 * compare({a:1, b:2}, {b:2, c:3, a:1});  // true
 * compare([1, [2]], [[3, 2], 1, 4]);  // true
 * compare({a: [1, 2], b: {c:3}}, {b: {d:4, c:3}, a:[3, 2, 1]});  // true
 * ```
 *
 * @param {*} expVal The expected value
 * @param {*} actVal The actual value
 * @returns {Boolean} Whether the expVal is equal to or deeply contained in actVal
 */
function compare(expVal, actVal) {
  let expType = Object.prototype.toString.call(expVal);
  let actType = Object.prototype.toString.call(actVal);

  if (expVal === null) {
    return actVal === null;
  } else if (expType !== actType) {
    return false;
  } else if (expType === '[object Array]') {
    return expVal.every(function (e) {
      return actVal.some(function (a) {
        return compare(e, a);
      });
    });
  } else if (expType === '[object Object]') {
    return Object.keys(expVal).every(function (k) {
      return Object.keys(actVal).includes(k) && compare(expVal[k], actVal[k]);
    });
  } else {
    return expVal === actVal;
  }
}

export {
  matchByEventType,
  matchBySchema,
  matchByVals,
  matchByParams,
  matchByContexts,
  matchEvents,
  compare,
  request,
  requestJson,
};
