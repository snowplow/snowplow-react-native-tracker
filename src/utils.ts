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

'use strict';

/**
 * Returns a function that accepts a side-effect function as its argument and subscribes
 * that function to aPromise's fullfillment,
 * and errHandle to aPromise's rejection.
 *
 * @param aPromise - A void Promise
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

/**
 * Returns a function that accepts a callback function as its argument and subscribes
 * that function to aPromise's fullfillment,
 * and errHandle to aPromise's rejection.
 *
 * @param aPromise - A void Promise
 * @param errHandle - A function to handle the promise being rejected
 * @returns - A function subscribed to the Promise's fullfillment
 */
function safeWaitCallback(
  callPromise: Promise<void>,
  errHandle: ((err: Error) => undefined)
) {
  return (<T,F extends ((...args: never[]) => Promise<T>)>(func: F) => {
    return (...args: Parameters<F>): ReturnType<F> | Promise<undefined> => {
      return callPromise.then(() => <ReturnType<F>>func(...args)).catch((err) => errHandle(err));
    };
  });
}

/**
 * Handles an error.
 *
 * @param err - The error to be handled.
 */
function errorHandler(err: Error): undefined {
  if (__DEV__) {
    console.warn('SnowplowTracker:' + err.message);
    return undefined;
  }
  return undefined;
}

/**
 * Helper to check whether its argument is of object type
 *
 * @param x - The argument to check.
 * @returns - A boolean
 */
function isObject<Type>(x: Type): boolean {
  return Object.prototype.toString.call(x) === '[object Object]';
}

export {
  safeWait,
  safeWaitCallback,
  errorHandler,
  isObject
};
