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

'use strict';

/*
 * Returns a function that accepts a function as its argument and subscribes
 * that function to aPromise's fullfillment,
 * and errHandle to aPromise's rejection.
 *
 * @param aPromise - A Promise
 * @param errHandle - A function to handle the promise being rejected
 * @returns - A function subscribed to the Promise's fullfillment
 */
function safeWait(aPromise: Promise<void>, errHandle: ((err: Error) => void)) {
  return (<F extends ((...args: never[]) => Promise<void>)>(func: F) => {
    return (...args: Parameters<F>): Promise<void> => {
      return aPromise.then(() => func(...args)).catch((err) => errHandle(err));
    };
  });
}

/*
 * Handles an error.
 *
 * @param err - The error to be handled.
 */
function errorHandler(err: Error): void {
  if (__DEV__) {
    console.warn(err.message);
  }
}

export {
  safeWait,
  errorHandler,
};
