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
import { isValidSD } from './events';
import { logMessages } from './constants';
import type {
  NetworkConfiguration,
  TrackerConfiguration,
  SessionConfiguration,
  EmitterConfiguration,
  SubjectConfiguration,
  GdprConfiguration,
  GCConfiguration,
  GlobalContext,
  InitTrackerConfiguration
} from './types';


/**
 * Configuration properties
 */
const networkProps = ['endpoint', 'method'];
const trackerProps= [
  'appId',
  'devicePlatform',
  'base64Encoding',
  'logLevel',
  'applicationContext',
  'platformContext',
  'geoLocationContext',
  'sessionContext',
  'deepLinkContext',
  'screenContext',
  'screenViewAutotracking',
  'lifecycleAutotracking',
  'installAutotracking',
  'exceptionAutotracking',
  'diagnosticAutotracking'
];
const sessionProps = [
  'foregroundTimeout',
  'backgroundTimeout'
];
const emitterProps = [
  'bufferOption',
  'emitRange',
  'threadPoolSize',
  'byteLimitPost',
  'byteLimitGet',
];
const subjectProps = [
  'userId',
  'networkUserId',
  'domainUserId',
  'useragent',
  'ipAddress',
  'timezone',
  'language',
  'screenResolution',
  'screenViewport',
  'colorDepth'
];
const gdprProps = [
  'basisForProcessing',
  'documentId',
  'documentVersion',
  'documentDescription'
];
const gcProps = [
  'tag',
  'globalContexts'
];

/**
 * Validates whether an object is of valid configuration given its default keys
 *
 * @param config {Object} - the object to validate
 * @param defaultKeys {Array} - the default keys to validate against
 * @returns - boolean
 */
function isValidConfig<Type>(config: Type, defaultKeys: Array<string>): config is Type {
  return Object.keys(config).every(key => defaultKeys.includes(key));
}

/**
 * Validates the networkConfig
 *
 * @param config {Object} - the config to validate
 * @returns - boolean
 */
function isValidNetworkConf(config: NetworkConfiguration): boolean {
  if (
    !isObject(config)
      || !isValidConfig(config, networkProps)
      || typeof config.endpoint !== 'string'
      || !config.endpoint
  ) {
    return false;
  }
  return true;
}

/**
 * Validates the trackerConfig
 *
 * @param config {Object} - the config to validate
 * @returns - boolean
 */
function isValidTrackerConf(config: TrackerConfiguration): boolean {
  if (!isObject(config) || !isValidConfig(config, trackerProps)) {
    return false;
  }
  return true;
}

/**
 * Validates the sessionConfig
 *
 * @param config {Object} - the config to validate
 * @returns - boolean
 */
function isValidSessionConf(config: SessionConfiguration): boolean {
  if (
    !isObject(config)
      || !isValidConfig(config, sessionProps)
      || !sessionProps.every(key => Object.keys(config as SessionConfiguration).includes(key))
  ) {
    return false;
  }
  return true;
}

/**
 * Validates the emitterConfig
 *
 * @param config {Object} - the config to validate
 * @returns - boolean
 */
function isValidEmitterConf(config: EmitterConfiguration): boolean {
  if (!isObject(config) || !isValidConfig(config, emitterProps)) {
    return false;
  }
  return true;
}

/**
 * Validates whether an object is of ScreenSize type
 *
 * @param arr {Object} - the object to validate
 * @returns - boolean
 */
function isScreenSize<Type>(arr: Type): boolean {
  return Array.isArray(arr)
    && arr.length === 2
    && arr.every(<Type>(n: Type) => typeof n === 'number');
}

/**
 * Validates the subjectConfig
 *
 * @param config {Object} - the config to validate
 * @returns - boolean
 */
function isValidSubjectConf(config: SubjectConfiguration): boolean {
  if (
    !isObject(config) || !isValidConfig(config, subjectProps)
  ) {
    return false;
  }

  // validating ScreenSize here to simplify array handling in bridge
  if (
    Object.prototype.hasOwnProperty.call(config, 'screenResolution')
      && config.screenResolution !== null
      && !isScreenSize(config.screenResolution as unknown)
  ) {
    return false;
  }

  if (
    Object.prototype.hasOwnProperty.call(config, 'screenViewport')
      && config.screenViewport !== null
      && !isScreenSize(config.screenViewport as unknown)
  ) {
    return false;
  }

  return true;
}

/**
 * Validates the gdprConfig
 *
 * @param config {Object} - the config to validate
 * @returns - boolean
 */
function isValidGdprConf(config: GdprConfiguration): boolean {
  if (
    !isObject(config)
      || !isValidConfig(config, gdprProps)
      || !gdprProps.every(key => Object.keys(config as GdprConfiguration).includes(key))
      || !['consent', 'contract', 'legal_obligation', 'legitimate_interests', 'public_task', 'vital_interests'].includes(config.basisForProcessing)
  ) {
    return false;
  }
  return true;
}

/**
 * Validates whether an object is of GlobalContext type
 *
 * @param gc {Object} - the object to validate
 * @returns - boolean
 */
function isValidGC(gc: GlobalContext): boolean {
  return isObject(gc)
    && isValidConfig(gc, gcProps)
    && typeof gc.tag === 'string'
    && Array.isArray(gc.globalContexts)
    && gc.globalContexts.every(c => isValidSD(c));
}

/**
 * Validates the GCConfig (global contexts)
 *
 * @param config {Object} - the config to validate
 * @returns - boolean
 */
function isValidGCConf(config: GCConfiguration): boolean {
  if (!Array.isArray(config)) {
    return false;
  }
  if (!config.every(gc => isValidGC(gc as GlobalContext))) {
    return false;
  }
  return true;
}

/**
 * Validates the initTrackerConfiguration
 *
 * @param init {Object} - the config to validate
 * @returns - boolean promise
 */
function initValidate(init: InitTrackerConfiguration): Promise<boolean> {
  if (typeof init.namespace !== 'string'  || !init.namespace) {
    return Promise.reject(new Error(logMessages.namespace));
  }

  if (
    !Object.prototype.hasOwnProperty.call(init, 'networkConfig')
      || !isValidNetworkConf(init.networkConfig as NetworkConfiguration)
  ) {
    return Promise.reject(new Error(logMessages.network));
  }

  if (
    Object.prototype.hasOwnProperty.call(init, 'trackerConfig')
      && !isValidTrackerConf(init.trackerConfig as TrackerConfiguration)
  ) {
    return Promise.reject(new Error(logMessages.tracker));
  }

  if (
    Object.prototype.hasOwnProperty.call(init, 'sessionConfig')
      && (!isValidSessionConf(init.sessionConfig as SessionConfiguration))
  ) {
    return Promise.reject(new Error(logMessages.session));
  }

  if (
    Object.prototype.hasOwnProperty.call(init, 'emitterConfig')
      && !isValidEmitterConf(init.emitterConfig as EmitterConfiguration)
  ) {
    return Promise.reject(new Error(logMessages.emitter));
  }

  if (
    Object.prototype.hasOwnProperty.call(init, 'subjectConfig')
      && !isValidSubjectConf(init.subjectConfig as SubjectConfiguration)
  ) {
    return Promise.reject(new Error(logMessages.subject));
  }

  if (
    Object.prototype.hasOwnProperty.call(init, 'gdprConfig')
      && !isValidGdprConf(init.gdprConfig as GdprConfiguration)) {
    return Promise.reject(new Error(logMessages.gdpr));
  }

  if (
    Object.prototype.hasOwnProperty.call(init, 'gcConfig')
      && !isValidGCConf(init.gcConfig as GCConfiguration)) {
    return Promise.reject(new Error(logMessages.gc));
  }

  return Promise.resolve(true);
}

export {
  isValidNetworkConf,
  isValidTrackerConf,
  isValidSessionConf,
  isValidEmitterConf,
  isValidSubjectConf,
  isValidGdprConf,
  isValidGCConf,
  isValidGC,
  isScreenSize,
  initValidate,
};
