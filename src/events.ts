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

import { isObject } from './utils';
import { logMessages } from './constants';
import type {
  SelfDescribing,
  EventContext,
  ScreenViewProps,
  StructuredProps,
  PageViewProps,
  TimingProps,
  ConsentGrantedProps,
  ConsentWithdrawnProps,
  EcommerceItem,
  EcommerceTransactionProps,
  DeepLinkReceivedProps,
  MessageNotificationProps,
} from './types';

/**
 * Validates whether an object is valid self-describing
 *
 * @param sd {Object} - the object to validate
 * @returns - boolean
 */
function isValidSD(sd: SelfDescribing | EventContext): boolean {
  return isObject(sd)
    && typeof sd.schema === 'string'
    && isObject(sd.data);
}

/**
 * Validates whether an object is a valid array of contexts
 *
 * @param contexts {Object} - the object to validate
 * @returns - boolean promise
 */
function validateContexts(contexts: EventContext[]): Promise<boolean> {
  const isValid = Object.prototype.toString.call(contexts) === '[object Array]'
    && contexts
      .map((c) => isValidSD(c))
      .reduce((acc,curr) => acc !== false && curr, true);

  if (!isValid) {
    return Promise.reject(new Error(logMessages.context));
  }

  return Promise.resolve(true);
}

/**
 * Validates whether an object is valid self describing
 *
 * @param argmap {Object} - the object to validate
 * @returns - boolean promise
 */
function validateSelfDesc(argmap: SelfDescribing,): Promise<boolean> {
  if (!isValidSD(argmap)) {
    return Promise.reject(new Error(logMessages.selfDesc));
  }

  return Promise.resolve(true);
}

/**
 * Validates a screen view event
 *
 * @param argmap {Object} - the object to validate
 * @returns - boolean promise
 */
function validateScreenView(argmap: ScreenViewProps): Promise<boolean> {
  // validate type
  if (!isObject(argmap)) {
    return Promise.reject(new Error(logMessages.evType));
  }
  // validate required props
  if (typeof argmap.name !== 'string') {
    return Promise.reject(new Error(logMessages.screenViewReq));
  }

  return Promise.resolve(true);
}

/**
 * Validates a structured event
 *
 * @param argmap {Object} - the object to validate
 * @returns - boolean promise
 */
function validateStructured(argmap: StructuredProps): Promise<boolean> {
  // validate type
  if (!isObject(argmap)) {
    return Promise.reject(new Error(logMessages.evType));
  }
  // validate required props
  if (
    typeof argmap.category !== 'string'
      || typeof argmap.action !== 'string'
  ) {
    return Promise.reject(new Error(logMessages.structuredReq));
  }

  return Promise.resolve(true);
}

/**
 * Validates a page-view event
 *
 * @param argmap {Object} - the object to validate
 * @returns - boolean promise
 */
function validatePageView(argmap: PageViewProps): Promise<boolean> {
  // validate type
  if (!isObject(argmap)) {
    return Promise.reject(new Error(logMessages.evType));
  }
  // validate required props
  if (typeof argmap.pageUrl !== 'string') {
    return Promise.reject(new Error(logMessages.pageviewReq));
  }

  return Promise.resolve(true);
}

/**
 * Validates a timing event
 *
 * @param argmap {Object} - the object to validate
 * @returns - boolean promise
 */
function validateTiming(argmap: TimingProps): Promise<boolean> {
  // validate type
  if (!isObject(argmap)) {
    return Promise.reject(new Error(logMessages.evType));
  }
  // validate required props
  if (
    typeof argmap.category !== 'string'
      || typeof argmap.variable !== 'string'
      || typeof argmap.timing !== 'number'
  ) {
    return Promise.reject(new Error(logMessages.timingReq));
  }

  return Promise.resolve(true);
}

/**
 * Validates a consent-granted event
 *
 * @param argmap {Object} - the object to validate
 * @returns - boolean promise
 */
function validateConsentGranted(argmap: ConsentGrantedProps): Promise<boolean> {
  // validate type
  if (!isObject(argmap)) {
    return Promise.reject(new Error(logMessages.evType));
  }
  // validate required props
  if (
    typeof argmap.expiry !== 'string'
      || typeof argmap.documentId !== 'string'
      || typeof argmap.version !== 'string'
  ) {
    return Promise.reject(new Error(logMessages.consentGReq));
  }

  return Promise.resolve(true);
}

/**
 * Validates a consent-withdrawn event
 *
 * @param argmap {Object} - the object to validate
 * @returns - boolean promise
 */
function validateConsentWithdrawn(argmap: ConsentWithdrawnProps): Promise<boolean> {
  // validate type
  if (!isObject(argmap)) {
    return Promise.reject(new Error(logMessages.evType));
  }
  // validate required props
  if (
    typeof argmap.all !== 'boolean'
      || typeof argmap.documentId !== 'string'
      || typeof argmap.version !== 'string'
  ) {
    return Promise.reject(new Error(logMessages.consentWReq));
  }

  return Promise.resolve(true);
}

/**
 * Validates a deep link received event
 *
 * @param argmap {Object} - the object to validate
 * @returns - boolean promise
 */
function validateDeepLinkReceived(argmap: DeepLinkReceivedProps): Promise<boolean> {
  // validate type
  if (!isObject(argmap)) {
    return Promise.reject(new Error(logMessages.evType));
  }
  // validate required props
  if (
    typeof argmap.url !== 'string'
  ) {
    return Promise.reject(new Error(logMessages.deepLinkReq));
  }

  return Promise.resolve(true);
}

/**
 * Validates a message notification event
 *
 * @param argmap {Object} - the object to validate
 * @returns - boolean promise
 */
function validateMessageNotification(argmap: MessageNotificationProps): Promise<boolean> {
  // validate type
  if (!isObject(argmap)) {
    return Promise.reject(new Error(logMessages.evType));
  }
  // validate required props
  if (
    typeof argmap.title !== 'string'
    || typeof argmap.body !== 'string'
    || typeof argmap.trigger !== 'string'
    || !['push', 'location', 'calendar', 'timeInterval', 'other'].includes(argmap.trigger)
  ) {
    return Promise.reject(new Error(logMessages.messageNotificationReq));
  }

  return Promise.resolve(true);
}

/**
 * Validates whether an object is valid ecommerce-item
 *
 * @param item {Object} - the object to validate
 * @returns - boolean
 */
function isValidEcomItem(item: EcommerceItem): boolean {
  if (
    isObject(item)
      && typeof item.sku === 'string'
      && typeof item.price === 'number'
      && typeof item.quantity === 'number'
  ) {
    return true;
  }
  return false;
}

/**
 * Validates an array of ecommerce-items
 *
 * @param items {Object} - the object to validate
 * @returns - boolean promise
 */
function validItemsArg(items: EcommerceItem[]): boolean {
  return Object.prototype.toString.call(items) === '[object Array]'
    && items
      .map((i) => isValidEcomItem(i))
      .reduce((acc,curr) => acc !== false && curr, true);
}

/**
 * Validates an ecommerce-transaction event
 *
 * @param argmap {Object} - the object to validate
 * @returns - boolean promise
 */
function validateEcommerceTransaction(argmap: EcommerceTransactionProps): Promise<boolean> {
  // validate type
  if (!isObject(argmap)) {
    return Promise.reject(new Error(logMessages.evType));
  }
  // validate required props
  if (
    typeof argmap.orderId !== 'string'
      || typeof argmap.totalValue !== 'number'
      || !validItemsArg(argmap.items)
  ) {
    return Promise.reject(new Error(logMessages.ecomReq));
  }

  return Promise.resolve(true);
}

export {
  isValidSD,
  validateContexts,
  validateSelfDesc,
  validateScreenView,
  validateStructured,
  validatePageView,
  validateTiming,
  validateConsentGranted,
  validateConsentWithdrawn,
  isValidEcomItem,
  validItemsArg,
  validateEcommerceTransaction,
  validateDeepLinkReceived,
  validateMessageNotification
};
