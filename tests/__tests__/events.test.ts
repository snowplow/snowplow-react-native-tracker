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

import * as e from '../../src/events';
import { logMessages } from '../../src/constants';

describe('test isValidSD', () => {
  test('test invalid type', () => {
    const testSD = undefined as any;
    expect(e.isValidSD(testSD)).toBe(false);
  });

  test('test invalid - no keys', () => {
    const testSD = {} as any;
    expect(e.isValidSD(testSD)).toBe(false);
  });

  test('test invalid schema', () => {
    const testSD = {
      schema: null,
      data: {test: 'test'}
    } as any;
    expect(e.isValidSD(testSD)).toBe(false);
  });

  test('test invalid data', () => {
    const testSD = {
      schema: 'testSchema',
      data: undefined
    } as any;
    expect(e.isValidSD(testSD)).toBe(false);
  });

  test('test valid', () => {
    const testSD = {
      schema: 'testSchema',
      data: {
        test: 'valid'
      }
    };
    expect(e.isValidSD(testSD)).toBe(true);
  });
});

describe('test validateContexts', () => {
  test('test invalid type', async () => {
    const testContexts = 'notArray' as any;
    await expect(e.validateContexts(testContexts)).rejects.toThrow(logMessages.context);
  });

  test('test invalid contexts', async () => {
    const testContexts = [
      {schema: 'test', data: {test: 'test'}},
      {schema: null, data: {test: 'invalid'}}
    ] as any;
    await expect(e.validateContexts(testContexts)).rejects.toThrow(logMessages.context);
  });

  test('test valid contexts - empty', async () => {
    const testContexts = [] as any;
    await expect(e.validateContexts(testContexts)).resolves.toBe(true);
  });

  test('test valid contexts', async () => {
    const testContexts = [
      {schema: 'test', data: {test: 'test'}},
      {schema: 'test', data: {test: 'valid'}}
    ];
    await expect(e.validateContexts(testContexts)).resolves.toBe(true);
  });
});

describe('test validateSelfDesc', () => {
  test('test invalid self-describing - wrong type', async () => {
    const testEv = undefined as any;
    await expect(e.validateSelfDesc(testEv)).rejects.toThrow(logMessages.selfDesc);
  });

  test('test invalid self-describing - empty object', async () => {
    const testEv = {} as any;
    await expect(e.validateSelfDesc(testEv)).rejects.toThrow(logMessages.selfDesc);
  });

  test('test valid self-describing', async () => {
    const testEv = {schema: 'test', data: {test: 'test'}};
    await expect(e.validateSelfDesc(testEv)).resolves.toBe(true);
  });
});

describe('test validateScreenView', () => {
  test('test invalid screen-view - wrong type', async () => {
    const testEv = null as any;
    await expect(e.validateScreenView(testEv)).rejects.toThrow(logMessages.evType);
  });

  test('test invalid screen-view - missing name', async () => {
    const testEv = {type: 'test'} as any;
    await expect(e.validateScreenView(testEv)).rejects.toThrow(logMessages.screenViewReq);
  });

  test('test invalid screen-view - wrong name', async () => {
    const testEv = {name: null} as any;
    await expect(e.validateScreenView(testEv)).rejects.toThrow(logMessages.screenViewReq);
  });

  test('test valid screen-view', async () => {
    const testEv = {
      name: 'test',
      type: 'test',
      previousName: 'preTest',
      transitionType: 'testing'
    };
    await expect(e.validateScreenView(testEv)).resolves.toBe(true);
  });
});

describe('test validateStructured', () => {
  test('test invalid structured - wrong type', async () => {
    const testEv = undefined as any;
    await expect(e.validateStructured(testEv)).rejects.toThrow(logMessages.evType);
  });

  test('test invalid structured - missing category', async () => {
    const testEv = {action: 'test'} as any;
    await expect(e.validateStructured(testEv)).rejects.toThrow(logMessages.structuredReq);
  });

  test('test invalid structured - missing action', async () => {
    const testEv = {category: 'test'} as any;
    await expect(e.validateStructured(testEv)).rejects.toThrow(logMessages.structuredReq);
  });

  test('test invalid structured - wrong category', async () => {
    const testEv = {category: null} as any;
    await expect(e.validateStructured(testEv)).rejects.toThrow(logMessages.structuredReq);
  });

  test('test invalid structured - wrong action', async () => {
    const testEv = {action: undefined} as any;
    await expect(e.validateStructured(testEv)).rejects.toThrow(logMessages.structuredReq);
  });

  test('test valid structured', async () => {
    const testEv = {
      category: 'test',
      action: 'test',
      label: 'test',
      property: 'test',
      value: 0
    };
    await expect(e.validateStructured(testEv)).resolves.toBe(true);
  });
});

describe('test validatePageView', () => {
  test('test invalid page-view - wrong type', async () => {
    const testEv = 'pageView' as any;
    await expect(e.validatePageView(testEv)).rejects.toThrow(logMessages.evType);
  });

  test('test invalid page-view - missing pageUrl', async () => {
    const testEv = {pageTitle: 'test'} as any;
    await expect(e.validatePageView(testEv)).rejects.toThrow(logMessages.pageviewReq);
  });

  test('test invalid page-view - missing pageUrl', async () => {
    const testEv = {pageUrl: null} as any;
    await expect(e.validatePageView(testEv)).rejects.toThrow(logMessages.pageviewReq);
  });

  test('test valid page-view', async () => {
    const testEv = {
      pageUrl: 'test.test',
      pageTitle: 'test',
      pageReferrer: 'tested'
    };
    await expect(e.validatePageView(testEv)).resolves.toBe(true);
  });
});

describe('test validateTiming', () => {
  test('test invalid timing - wrong type', async () => {
    const testEv = undefined as any;
    await expect(e.validateTiming(testEv)).rejects.toThrow(logMessages.evType);
  });

  test('test invalid timing - missing category', async () => {
    const testEv = {
      variable: 'test',
      timing: 0
    } as any;
    await expect(e.validateTiming(testEv)).rejects.toThrow(logMessages.timingReq);
  });

  test('test invalid timing - missing variable', async () => {
    const testEv = {
      category: 'test',
      timing: 0
    } as any;
    await expect(e.validateTiming(testEv)).rejects.toThrow(logMessages.timingReq);
  });

  test('test invalid timing - missing timing', async () => {
    const testEv = {
      category: 'testing',
      variable: 'test'
    } as any;
    await expect(e.validateTiming(testEv)).rejects.toThrow(logMessages.timingReq);
  });

  test('test invalid timing - wrong category', async () => {
    const testEv = {
      category: null,
      variable: 'test',
      timing: 0
    } as any;
    await expect(e.validateTiming(testEv)).rejects.toThrow(logMessages.timingReq);
  });

  test('test invalid timing - wrong variable', async () => {
    const testEv = {
      category: 'test',
      variable: null,
      timing: 0
    } as any;
    await expect(e.validateTiming(testEv)).rejects.toThrow(logMessages.timingReq);
  });

  test('test invalid timing - wrong timing', async () => {
    const testEv = {
      category: 'testing',
      variable: 'test',
      timing: 'invalid'
    } as any;
    await expect(e.validateTiming(testEv)).rejects.toThrow(logMessages.timingReq);
  });

  test('test valid timing', async () => {
    const testEv = {
      category: 'testing',
      variable: 'test',
      timing: 0,
      label: 'test'
    };
    await expect(e.validateTiming(testEv)).resolves.toBe(true);
  });
});

describe('test validateConsentGranted', () => {
  test('test invalid consentGranted - wrong type', async () => {
    const testEv = null as any;
    await expect(e.validateConsentGranted(testEv)).rejects.toThrow(logMessages.evType);
  });

  test('test invalid consentGranted - missing expiry', async () => {
    const testEv = {
      documentId: 'testId',
      version: '0.0.1'
    } as any;
    await expect(e.validateConsentGranted(testEv)).rejects.toThrow(logMessages.consentGReq);
  });

  test('test invalid consentGranted - missing documentId', async () => {
    const testEv = {
      expiry: '2022-01-01T00:00:00Z',
      version: '0.0.1'
    } as any;
    await expect(e.validateConsentGranted(testEv)).rejects.toThrow(logMessages.consentGReq);
  });

  test('test invalid consentGranted - missing version', async () => {
    const testEv = {
      expiry: '2022-01-01T00:00:00Z',
      documentId: 'testId',
    } as any;
    await expect(e.validateConsentGranted(testEv)).rejects.toThrow(logMessages.consentGReq);
  });

  test('test invalid consentGranted - wrong expiry', async () => {
    const testEv = {
      expiry: 0,
      documentId: 'testId',
      version: '0.0.1',
    } as any;
    await expect(e.validateConsentGranted(testEv)).rejects.toThrow(logMessages.consentGReq);
  });

  test('test invalid consentGranted - wrong documentId', async () => {
    const testEv = {
      expiry: '2022-01-01T00:00:00Z',
      documentId: 0,
      version: '0.0.1',
    } as any;
    await expect(e.validateConsentGranted(testEv)).rejects.toThrow(logMessages.consentGReq);
  });

  test('test invalid consentGranted - wrong version', async () => {
    const testEv = {
      expiry: '2022-01-01T00:00:00Z',
      documentId: 'testId',
      version: undefined,
    } as any;
    await expect(e.validateConsentGranted(testEv)).rejects.toThrow(logMessages.consentGReq);
  });

  test('test valid consentGranted', async () => {
    const testEv = {
      expiry: '2022-01-01T00:00:00Z',
      documentId: 'testId',
      version: '0.0.1',
      name: 'testName',
      documentDescription: 'testDescription'
    };
    await expect(e.validateConsentGranted(testEv)).resolves.toBe(true);
  });
});

describe('test validateConsentWithdrawn', () => {
  test('test invalid consentWithdrawn - wrong type', async () => {
    const testEv = null as any;
    await expect(e.validateConsentWithdrawn(testEv)).rejects.toThrow(logMessages.evType);
  });

  test('test invalid consentWithdrawn - missing all', async () => {
    const testEv = {
      documentId: 'testId',
      version: '0.0.1'
    } as any;
    await expect(e.validateConsentWithdrawn(testEv)).rejects.toThrow(logMessages.consentWReq);
  });

  test('test invalid consentWithdrawn - missing documentId', async () => {
    const testEv = {
      all: false,
      version: '0.0.1'
    } as any;
    await expect(e.validateConsentWithdrawn(testEv)).rejects.toThrow(logMessages.consentWReq);
  });

  test('test invalid consentWithdrawn - missing version', async () => {
    const testEv = {
      all: true,
      documentId: 'testId',
    } as any;
    await expect(e.validateConsentWithdrawn(testEv)).rejects.toThrow(logMessages.consentWReq);
  });

  test('test invalid consentWithdrawn - wrong all', async () => {
    const testEv = {
      all: 'wrong',
      documentId: 'testId',
      version: '0.0.1',
    } as any;
    await expect(e.validateConsentWithdrawn(testEv)).rejects.toThrow(logMessages.consentWReq);
  });

  test('test invalid consentWithdrawn - wrong documentId', async () => {
    const testEv = {
      all: true,
      documentId: null,
      version: '0.0.1',
    } as any;
    await expect(e.validateConsentWithdrawn(testEv)).rejects.toThrow(logMessages.consentWReq);
  });

  test('test invalid consentWithdrawn - wrong version', async () => {
    const testEv = {
      all: true,
      documentId: 'testId',
      version: 0,
    } as any;
    await expect(e.validateConsentWithdrawn(testEv)).rejects.toThrow(logMessages.consentWReq);
  });

  test('test valid consentWithdrawn', async () => {
    const testEv = {
      all: true,
      documentId: 'testId',
      version: '0.0.1',
      name: 'testName',
      documentDescription: 'testDescription'
    };
    await expect(e.validateConsentWithdrawn(testEv)).resolves.toBe(true);
  });
});

describe('test validateDeepLinkReceived', () => {
  test('test invalid deepLinkReceived - wrong type', async () => {
    const testEv = null as any;
    await expect(e.validateDeepLinkReceived(testEv)).rejects.toThrow(logMessages.evType);
  });

  test('test invalid deepLinkReceived - missing url', async () => {
    const testEv = {
    } as any;
    await expect(e.validateDeepLinkReceived(testEv)).rejects.toThrow(logMessages.deepLinkReq);
  });

  test('test invalid deepLinkReceived - invalid url', async () => {
    const testEv = {
      url: true
    } as any;
    await expect(e.validateDeepLinkReceived(testEv)).rejects.toThrow(logMessages.deepLinkReq);
  });

  test('test valid deepLinkReceived', async () => {
    const testEv = {
      url: 'https://example.com/to',
      referrer: 'https://example.com/from'
    };
    await expect(e.validateDeepLinkReceived(testEv)).resolves.toBe(true);
  });
});

describe('test validateMessageNotification', () => {
  test('test invalid messageNotification - wrong type', async () => {
    const testEv = null as any;
    await expect(e.validateMessageNotification(testEv)).rejects.toThrow(logMessages.evType);
  });

  test('test invalid messageNotification - missing properties', async () => {
    const testEv = {
    } as any;
    await expect(e.validateMessageNotification(testEv)).rejects.toThrow(logMessages.messageNotificationReq);
  });

  test('test invalid messageNotification - invalid trigger', async () => {
    const testEv = {
      title: 'x', body: 'y', trigger: 'z'
    } as any;
    await expect(e.validateMessageNotification(testEv)).rejects.toThrow(logMessages.messageNotificationReq);
  });

  test('test valid messageNotification', async () => {
    const testEv = {
      title: 'x', body: 'y', trigger: 'push'
    } as any;
    await expect(e.validateMessageNotification(testEv)).resolves.toBe(true);
  });
});

describe('test isValidEcomItem', () => {
  test('invalid - wrong type', () => {
    const testItem = 'invalid' as any;
    expect(e.isValidEcomItem(testItem)).toBe(false);
  });
  test('invalid - missing sku', () => {
    const testItem = {
      price: 0.1,
      quantity: 1
    } as any;
    expect(e.isValidEcomItem(testItem)).toBe(false);
  });
  test('invalid - missing price', () => {
    const testItem = {
      sku: '123',
      quantity: 1
    } as any;
    expect(e.isValidEcomItem(testItem)).toBe(false);
  });
  test('invalid - missing quantity', () => {
    const testItem = {
      sku: '123',
      price: 0.1,
    } as any;
    expect(e.isValidEcomItem(testItem)).toBe(false);
  });
  test('invalid - wrong sku', () => {
    const testItem = {
      sku: 123,
      price: 0.1,
      quantity: 1
    } as any;
    expect(e.isValidEcomItem(testItem)).toBe(false);
  });
  test('invalid - wrong price', () => {
    const testItem = {
      sku: '123',
      price: '0.1',
      quantity: 1
    } as any;
    expect(e.isValidEcomItem(testItem)).toBe(false);
  });
  test('invalid - wrong quantity', () => {
    const testItem = {
      sku: '123',
      price: 0.1,
      quantity: '1'
    } as any;
    expect(e.isValidEcomItem(testItem)).toBe(false);
  });
  test('valid', () => {
    const testItem = {
      sku: '123',
      price: 0.1,
      quantity: 1
    };
    expect(e.isValidEcomItem(testItem)).toBe(true);
  });
});

describe('test validItemsArg', () => {

  test('invalid - not an array', () => {
    const testArg = undefined as any;
    expect(e.validItemsArg(testArg)).toBe(false);
  });

  test('invalid', () => {
    const testArg = [
      {
        sku: '123',
        price: 0.1,
        quantity: 1
      },
      {
        sku: null,
        price: 0.1,
        quantity: 1
      }
    ] as any;
    expect(e.validItemsArg(testArg)).toBe(false);
  });

  test('valid - empty', () => {
    const testArg = [] as any;
    expect(e.validItemsArg(testArg)).toBe(true);
  });

  test('valid', () => {
    const testArg = [
      {
        sku: '123',
        price: 0.1,
        quantity: 1
      }
    ];
    expect(e.validItemsArg(testArg)).toBe(true);
  });
});


describe('test validateEcommerceTransaction', () => {
  test('invalid - wrong type', async () => {
    const testEcom = null as any;
    await expect(e.validateEcommerceTransaction(testEcom)).rejects.toThrow(logMessages.evType);
  });

  test('invalid - missing orderId', async () => {
    const testEcom = {
      totalValue: 0.1,
      items: [{
        sku: '123',
        price: 0.1,
        quantity: 1
      }]
    } as any;
    await expect(e.validateEcommerceTransaction(testEcom)).rejects.toThrow(logMessages.ecomReq);
  });

  test('invalid - missing totalValue', async () => {
    const testEcom = {
      orderId: '123',
      items: [{
        sku: '123',
        price: 0.1,
        quantity: 1
      }]
    } as any;
    await expect(e.validateEcommerceTransaction(testEcom)).rejects.toThrow(logMessages.ecomReq);
  });

  test('invalid - missing items', async () => {
    const testEcom = {
      orderId: '123',
      totalValue: 0.1
    } as any;
    await expect(e.validateEcommerceTransaction(testEcom)).rejects.toThrow(logMessages.ecomReq);
  });

  test('invalid - wrong orderId', async () => {
    const testEcom = {
      orderId: 123,
      totalValue: 0.1,
      items: [{
        sku: '123',
        price: 0.1,
        quantity: 1
      }]
    } as any;
    await expect(e.validateEcommerceTransaction(testEcom)).rejects.toThrow(logMessages.ecomReq);
  });

  test('invalid - wrong totalValue', async () => {
    const testEcom = {
      orderId: '123',
      totalValue: '0.1',
      items: [{
        sku: '123',
        price: 0.1,
        quantity: 1
      }]
    } as any;
    await expect(e.validateEcommerceTransaction(testEcom)).rejects.toThrow(logMessages.ecomReq);
  });

  test('invalid - wrong items', async () => {
    const testEcom = {
      orderId: '123',
      totalValue: 0.1,
      items: [{
        sku: '123',
        quantity: 1
      }]
    } as any;
    await expect(e.validateEcommerceTransaction(testEcom)).rejects.toThrow(logMessages.ecomReq);
  });

  test('valid', async () => {
    const testEcom = {
      orderId: '123',
      totalValue: 0.1,
      items: [{
        sku: '123',
        price: 0.1,
        quantity: 1
      }]
    };
    await expect(e.validateEcommerceTransaction(testEcom)).resolves.toBe(true);
  });
});
