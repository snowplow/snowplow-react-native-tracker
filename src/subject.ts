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

import { RNSnowplowTracker } from './native';
import { logMessages } from './constants';
import {
  isScreenSize,
  isValidSubjectConf
} from './configurations';
import type {
  ScreenSize,
  SubjectConfiguration
} from './types';

/**
 * Sets the userId of the tracker subject
 *
 * @param namespace {string} - the tracker namespace
 * @param newUid {string | null} - the new userId
 * @returns - Promise
 */
function setUserId(namespace: string, newUid: string | null): Promise<void> {
  if (!(newUid === null || typeof newUid === 'string')) {
    return Promise.reject(new Error(logMessages.setUserId));
  }
  return <Promise<void>>Promise.resolve(RNSnowplowTracker.setUserId({
    tracker:namespace,
    userId: newUid
  }));
}

/**
 * Sets the networkUserId of the tracker subject
 *
 * @param namespace {string} - the tracker namespace
 * @param newNuid {string | null} - the new networkUserId
 * @returns - Promise
 */
function setNetworkUserId(namespace: string, newNuid: string | null): Promise<void> {
  if (!(newNuid === null || typeof newNuid === 'string')) {
    return Promise.reject(new Error(logMessages.setNetworkUserId));
  }
  return <Promise<void>>Promise.resolve(RNSnowplowTracker.setNetworkUserId({
    tracker:namespace,
    networkUserId: newNuid
  }));
}

/**
 * Sets the domainUserId of the tracker subject
 *
 * @param namespace {string} - the tracker namespace
 * @param newDuid {string | null} - the new domainUserId
 * @returns - Promise
 */
function setDomainUserId(namespace: string, newDuid: string | null): Promise<void> {
  if (!(newDuid === null || typeof newDuid === 'string')) {
    return Promise.reject(new Error(logMessages.setDomainUserId));
  }
  return <Promise<void>>Promise.resolve(RNSnowplowTracker.setDomainUserId({
    tracker:namespace,
    domainUserId: newDuid
  }));
}

/**
 * Sets the ipAddress of the tracker subject
 *
 * @param namespace {string} - the tracker namespace
 * @param newIp {string | null} - the new ipAddress
 * @returns - Promise
 */
function setIpAddress(namespace: string, newIp: string | null): Promise<void> {
  if (!(newIp === null || typeof newIp === 'string')) {
    return Promise.reject(new Error(logMessages.setIpAddress));
  }
  return <Promise<void>>Promise.resolve(RNSnowplowTracker.setIpAddress({
    tracker:namespace,
    ipAddress: newIp
  }));
}

/**
 * Sets the useragent of the tracker subject
 *
 * @param namespace {string} - the tracker namespace
 * @param newUagent {string | null} - the new useragent
 * @returns - Promise
 */
function setUseragent(namespace: string, newUagent: string | null): Promise<void> {
  if (!(newUagent === null || typeof newUagent === 'string')) {
    return Promise.reject(new Error(logMessages.setUseragent));
  }
  return <Promise<void>>Promise.resolve(RNSnowplowTracker.setUseragent({
    tracker:namespace,
    useragent: newUagent
  }));
}

/**
 * Sets the timezone of the tracker subject
 *
 * @param namespace {string} - the tracker namespace
 * @param newTz {string | null} - the new timezone
 * @returns - Promise
 */
function setTimezone(namespace: string, newTz: string | null): Promise<void> {
  if (!(newTz === null || typeof newTz === 'string')) {
    return Promise.reject(new Error(logMessages.setTimezone));
  }
  return <Promise<void>>Promise.resolve(RNSnowplowTracker.setTimezone({
    tracker:namespace,
    timezone: newTz
  }));
}

/**
 * Sets the language of the tracker subject
 *
 * @param namespace {string} - the tracker namespace
 * @param newLang {string | null} - the new language
 * @returns - Promise
 */
function setLanguage(namespace: string, newLang: string | null): Promise<void> {
  if (!(newLang === null || typeof newLang === 'string')) {
    return Promise.reject(new Error(logMessages.setLanguage));
  }
  return <Promise<void>>Promise.resolve(RNSnowplowTracker.setLanguage({
    tracker:namespace,
    language: newLang
  }));
}

/**
 * Sets the screenResolution of the tracker subject
 *
 * @param namespace {string} - the tracker namespace
 * @param newRes {ScreenSize | null} - the new screenResolution
 * @returns - Promise
 */
function setScreenResolution(namespace: string, newRes: ScreenSize | null): Promise<void> {
  if (!(newRes === null || isScreenSize(newRes))) {
    return Promise.reject(new Error(logMessages.setScreenResolution));
  }
  return <Promise<void>>Promise.resolve(RNSnowplowTracker.setScreenResolution({
    tracker:namespace,
    screenResolution: newRes
  }));
}

/**
 * Sets the screenViewport of the tracker subject
 *
 * @param namespace {string} - the tracker namespace
 * @param newView {ScreenSize | null} - the new screenViewport
 * @returns - Promise
 */
function setScreenViewport(namespace: string, newView: ScreenSize | null): Promise<void> {
  if (!(newView === null || isScreenSize(newView))) {
    return Promise.reject(new Error(logMessages.setScreenViewport));
  }
  return <Promise<void>>Promise.resolve(RNSnowplowTracker.setScreenViewport({
    tracker:namespace,
    screenViewport: newView
  }));
}

/**
 * Sets the colorDepth of the tracker subject
 *
 * @param namespace {string} - the tracker namespace
 * @param newColorD {number | null} - the new colorDepth
 * @returns - Promise
 */
function setColorDepth(namespace: string, newColorD: number | null): Promise<void> {
  if (!(newColorD === null || typeof newColorD === 'number')) {
    return Promise.reject(new Error(logMessages.setColorDepth));
  }
  return <Promise<void>>Promise.resolve(RNSnowplowTracker.setColorDepth({
    tracker:namespace,
    colorDepth: newColorD
  }));
}

const setterMap = {
  userId: setUserId,
  networkUserId: setNetworkUserId,
  domainUserId: setDomainUserId,
  ipAddress: setIpAddress,
  useragent: setUseragent,
  timezone: setTimezone,
  language: setLanguage,
  screenResolution: setScreenResolution,
  screenViewport: setScreenViewport,
  colorDepth: setColorDepth
} as Record<keyof SubjectConfiguration, <Type>(namespace: string, x: Type | null) => Promise<void>>;

/**
 * Sets the tracker subject
 *
 * @param namespace {string} - the tracker namespace
 * @param config {SubjectConfiguration} - the new subject data
 * @returns - Promise
 */
function setSubjectData(
  namespace: string,
  config: SubjectConfiguration
): Promise<void> {
  if (!isValidSubjectConf(config)) {
    return Promise.reject(new Error(`${logMessages.setSubjectData} ${logMessages.subject}`));
  }

  const promises = Object.keys(config)
    .map((k) => {
      const fun = setterMap[k];
      return fun ? fun(namespace, config[k]) : undefined;
    })
    .filter((f) => f !== undefined);

  // to use Promise.all (Promise.allSettled not supported in all RN versions)
  const safePromises = promises
    .map((p) => (p as Promise<void>)
      .then((x) => Object.assign({
        status: 'fulfilled',
        value: x}) as PromiseFulfilledResult<void>)
      .catch((err) => Object.assign({
        status: 'rejected',
        reason: err.message as string}) as PromiseRejectedResult));

  return <Promise<void>>Promise.all(safePromises).then((outcomes) => {
    const anyReasons = outcomes.filter((res) => res.status === 'rejected') as PromiseRejectedResult[];
    if (anyReasons.length > 0) {
      const allReasons = anyReasons
        .reduce((acc, curr) => acc + ':' + curr.reason, logMessages.setSubjectData);
      throw new Error(allReasons);
    }
    return true;
  });
}

export {
  setUserId,
  setNetworkUserId,
  setDomainUserId,
  setIpAddress,
  setUseragent,
  setTimezone,
  setLanguage,
  setScreenResolution,
  setScreenViewport,
  setColorDepth,
  setSubjectData
};
