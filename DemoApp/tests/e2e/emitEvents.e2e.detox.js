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

const commands = require('./helpers/microCommands.js');

describe('Example', () => {
  beforeAll(async () => {
    await commands.resetMicro();
  });

  afterEach(async () => {
    await commands.sleep(1000);
  });
  afterAll(async () => {
    await commands.sleep(5000);
  });

  it('should tap Screen-view Button', async () => {
    await waitFor(element(by.label('testScreenView')))
      .toBeVisible()
      .whileElement(by.id('scrollView'))
      .scroll(100, 'down');

    await element(by.label('testScreenView')).tap();
  });

  it('should tap Self-describing Button', async () => {
    await waitFor(element(by.label('testSelfDesc')))
      .toBeVisible()
      .whileElement(by.id('scrollView'))
      .scroll(100, 'down');

    await element(by.label('testSelfDesc')).tap();
  });

  it('should tap Structured Button', async () => {
    await waitFor(element(by.label('testStruct')))
      .toBeVisible()
      .whileElement(by.id('scrollView'))
      .scroll(100, 'down');

    await element(by.label('testStruct')).tap();
  });

  it('should tap Page-view Button', async () => {
    await waitFor(element(by.label('testPageView')))
      .toBeVisible()
      .whileElement(by.id('scrollView'))
      .scroll(100, 'down');

    await element(by.label('testPageView')).tap();
  });

  it('should tap Deep Link Button', async () => {
    await waitFor(element(by.label('testDeepLinkReceived')))
      .toBeVisible()
      .whileElement(by.id('scrollView'))
      .scroll(100, 'down');

    await element(by.label('testDeepLinkReceived')).tap();
  });

  it('should tap Message Notification Button', async () => {
    await waitFor(element(by.label('testMessageNotification')))
      .toBeVisible()
      .whileElement(by.id('scrollView'))
      .scroll(100, 'down');

    await element(by.label('testMessageNotification')).tap();
  });

  it('should tap Second tracker Button', async () => {
    await waitFor(element(by.label('testSecTracker')))
      .toBeVisible()
      .whileElement(by.id('scrollView'))
      .scroll(100, 'down');

    await element(by.label('testSecTracker')).tap();
  });

  it('should tap Subject Button', async () => {
    await waitFor(element(by.label('testSetSubject')))
      .toBeVisible()
      .whileElement(by.id('scrollView'))
      .scroll(100, 'down');

    await element(by.label('testSetSubject')).tap();
  });
});
