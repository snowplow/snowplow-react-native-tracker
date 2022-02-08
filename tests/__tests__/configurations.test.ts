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

import * as c from '../../src/configurations';
import { logMessages } from '../../src/constants';

/**
 * initValidate
 */
describe('test initValidate rejects', () => {
  test('test missing namespace', async () => {
    const testConfig = {
      networkConfig: {endpoint: 'test'}
    };
    await expect(c.initValidate(testConfig as any)).rejects.toThrow(logMessages.namespace);
  });

  test('test invalid namespace', async () => {
    const testConfig = {
      namespace: '',
      networkConfig: {endpoint: 'test'}
    };
    await expect(c.initValidate(testConfig as any)).rejects.toThrow(logMessages.namespace);
  });

  test('test missing endpoint', async () => {
    const testConfig = {
      namespace: 'sp1',
      networkConfig: {'method': 'get'}
    };
    await expect(c.initValidate(testConfig as any)).rejects.toThrow(logMessages.network);
  });

  test('test invalid endpoint', async () => {
    const testConfig = {
      namespace: 'sp1',
      networkConfig: {'endpoint': '', 'method': 'get'}
    };
    await expect(c.initValidate(testConfig as any)).rejects.toThrow(logMessages.network);
  });

  test('test invalid networkConfig', async () => {
    const testConfig = {
      namespace: 'sp1',
      networkConfig: {endpoint: 'test', invalid: true}
    };
    await expect(c.initValidate(testConfig as any)).rejects.toThrow(logMessages.network);
  });

  test('test invalid trackerConfig', async () => {
    const testConfig = {
      namespace: 'sp1',
      networkConfig: {endpoint: 'test'},
      trackerConfig: {invalid: true}
    };
    await expect(c.initValidate(testConfig as any)).rejects.toThrow(logMessages.tracker);
  });

  test('test invalid sessionConfig', async () => {
    const testConfig = {
      namespace: 'sp1',
      networkConfig: {endpoint: 'test'},
      sessionConfig: {invalid: true}
    };
    await expect(c.initValidate(testConfig as any)).rejects.toThrow(logMessages.session);
  });

  test('test invalid emitterConfig', async () => {
    const testConfig = {
      namespace: 'sp1',
      networkConfig: {endpoint: 'test'},
      emitterConfig: {invalid: true}
    };
    await expect(c.initValidate(testConfig as any)).rejects.toThrow(logMessages.emitter);
  });

  test('test invalid subjectConfig', async () => {
    const testConfig = {
      namespace: 'sp1',
      networkConfig: {endpoint: 'test'},
      subjectConfig: {userId: 'tester', invalid: true}
    };
    await expect(c.initValidate(testConfig as any)).rejects.toThrow(logMessages.subject);
  });

  test('test invalid gdprConfig - extra', async () => {
    const testConfig = {
      namespace: 'sp1',
      networkConfig: {endpoint: 'test'},
      gdprConfig: {
        basisForProcessing: 'consent',
        documentId: '12345',
        documentVersion: '1.0.0',
        documentDescription: 'gdpr document description',
        invalid: true
      }
    };
    await expect(c.initValidate(testConfig as any)).rejects.toThrow(logMessages.gdpr);
  });

  test('test invalid gdprConfig - missing', async () => {
    const testConfig = {
      namespace: 'sp1',
      networkConfig: {endpoint: 'test'},
      gdprConfig: {
        basisForProcessing: 'consent',
        documentId: '12345',
        documentVersion: '1.0.0'
      }
    };
    await expect(c.initValidate(testConfig as any)).rejects.toThrow(logMessages.gdpr);
  });

  test('test invalid gdprConfig - basis', async () => {
    const testConfig = {
      namespace: 'sp1',
      networkConfig: {endpoint: 'test'},
      gdprConfig: {
        basisForProcessing: 'invalid',
        documentId: '12345',
        documentVersion: '1.0.0',
        documentDescription: 'gdpr document description',
      }
    };
    await expect(c.initValidate(testConfig as any)).rejects.toThrow(logMessages.gdpr);
  });
});

// when initValidate resolves
describe('test initValidate resolves', () => {
  test('test minimal required', async () => {
    const testConfig = {
      namespace: 'sp1',
      networkConfig: {endpoint: 'test'}
    };
    await expect(c.initValidate(testConfig as any)).resolves.toBe(true);
  });

  test('test valid networkConfig', async () => {
    const testConfig = {
      namespace: 'sp1',
      networkConfig: {endpoint: 'test', method: 'get'}
    };
    await expect(c.initValidate(testConfig as any)).resolves.toBe(true);
  });

  test('test valid trackerConfig', async () => {
    const testConfig = {
      namespace: 'sp1',
      networkConfig: {endpoint: 'test'},
      trackerConfig: {base64Encoding: false}
    };
    await expect(c.initValidate(testConfig as any)).resolves.toBe(true);
  });

  test('test valid sessionConfig', async () => {
    const testConfig = {
      namespace: 'sp1',
      networkConfig: {endpoint: 'test'},
      sessionConfig: {foregroundTimeout: 100, backgroundTimeout: 100}
    };
    await expect(c.initValidate(testConfig as any)).resolves.toBe(true);
  });

  test('test valid emitterConfig', async () => {
    const testConfig = {
      namespace: 'sp1',
      networkConfig: {endpoint: 'test'},
      emitterConfig: {byteLimitPost: 20000}
    };
    await expect(c.initValidate(testConfig as any)).resolves.toBe(true);
  });

  test('test valid subjectConfig', async () => {
    const testConfig = {
      namespace: 'sp1',
      networkConfig: {endpoint: 'test'},
      subjectConfig: {userId: 'tester', language: 'javascript'}
    };
    await expect(c.initValidate(testConfig as any)).resolves.toBe(true);
  });

  test('test valid gdprConfig', async () => {
    const testConfig = {
      namespace: 'sp1',
      networkConfig: {endpoint: 'test'},
      gdprConfig: {
        basisForProcessing: 'consent',
        documentId: '12345',
        documentVersion: '1.0.0',
        documentDescription: 'gdpr document description'
      }
    };
    await expect(c.initValidate(testConfig as any)).resolves.toBe(true);
  });

  test('test with all defaults', async () => {
    const testConfig = {
      namespace: 'sp1',
      networkConfig: {endpoint: 'test', method: 'post'},
      trackerConfig: {
        devicePlatform: 'mob',
        base64Encoding: true,
        logLevel: 'off',
        applicationContext: true,
        platformContext: true,
        geoLocationContext: false,
        sessionContext: true,
        deepLinkContext: true,
        screenContext: true,
        screenViewAutotracking: true,
        lifecycleAutotracking: false,
        installAutotracking: true,
        exceptionAutotracking: true,
        diagnosticAutotracking: false
      },
      sessionConfig: {
        foregroundTimeout: 30,
        backgroundTimeout: 30
      },
      emitterConfig: {
        bufferOption: 'single',
        emitRange: 150,
        threadPoolSize: 15,
        byteLimitPost: 40000,
        byteLimitGet: 40000,
      }
    };
    await expect(c.initValidate(testConfig as any)).resolves.toBe(true);
  });
});

describe('test isValidNetworkConf', () => {
  test('invalid - type', () => {
    const testConf = undefined as any;
    expect(c.isValidNetworkConf(testConf)).toBe(false);
  });

  test('invalid - invalid props', () => {
    const testConf = {
      endpoint: 'test',
      invalid: true
    } as any;
    expect(c.isValidNetworkConf(testConf)).toBe(false);
  });

  test('invalid - missing endpoint', () => {
    const testConf = {
      method: 'get'
    } as any;
    expect(c.isValidNetworkConf(testConf)).toBe(false);
  });

  test('invalid - empty endpoint', () => {
    const testConf = {
      endpoint: '',
      method: 'get'
    } as any;
    expect(c.isValidNetworkConf(testConf)).toBe(false);
  });

  test('valid', () => {
    const testConf = {
      endpoint: '0.0.0.0:9090',
      method: 'post'
    } as any;
    expect(c.isValidNetworkConf(testConf)).toBe(true);
  });
});

describe('test isValidTrackerConf', () => {
  test('invalid - type', () => {
    const testConf = undefined as any;
    expect(c.isValidTrackerConf(testConf)).toBe(false);
  });

  test('invalid - invalid props', () => {
    const testConf = {
      appId: 'test',
      invalid: true
    } as any;
    expect(c.isValidTrackerConf(testConf)).toBe(false);
  });

  test('valid', () => {
    const testConf = {
      appId: 'test',
      applicationContext: true,
      base64Encoding: true,
      devicePlatform: 'mob',
      diagnosticAutotracking: false,
      exceptionAutotracking: true,
      geoLocationContext: false,
      installAutotracking: true,
      lifecycleAutotracking: false,
      logLevel: 'off',
      platformContext: true,
      screenContext: true,
      screenViewAutotracking: true,
      sessionContext: true,
      deepLinkContext: true
    } as any;
    expect(c.isValidTrackerConf(testConf)).toBe(true);
  });
});

describe('test isValidSessionConf', () => {
  test('invalid - type', () => {
    const testConf = undefined as any;
    expect(c.isValidSessionConf(testConf)).toBe(false);
  });

  test('invalid - invalid props', () => {
    const testConf = {
      backgroundTimeout: 30,
      invalid: true
    } as any;
    expect(c.isValidSessionConf(testConf)).toBe(false);
  });

  test('invalid - missing props', () => {
    const testConf = {
      backgroundTimeout: 30,
    } as any;
    expect(c.isValidSessionConf(testConf)).toBe(false);
  });

  test('valid', () => {
    const testConf = {
      foregroundTimeout: 30,
      backgroundTimeout: 30
    };
    expect(c.isValidSessionConf(testConf)).toBe(true);
  });
});

describe('test isValidEmitterConf', () => {
  test('invalid - type', () => {
    const testConf = undefined as any;
    expect(c.isValidEmitterConf(testConf)).toBe(false);
  });

  test('invalid - invalid props', () => {
    const testConf = {
      bufferOption: 'default',
      invalid: true
    } as any;
    expect(c.isValidEmitterConf(testConf)).toBe(false);
  });

  test('valid', () => {
    const testConf = {
      bufferOption: 'single',
      byteLimitGet: 40000,
      byteLimitPost: 40000,
      emitRange: 150,
      threadPoolSize: 15,
    } as any;
    expect(c.isValidEmitterConf(testConf)).toBe(true);
  });
});

describe('test isScreenSize', () => {
  test('invalid - type', () => {
    const testSize = 'invalid' as any;
    expect(c.isScreenSize(testSize)).toBe(false);
  });

  test('invalid - array size', () => {
    const testSizeA = [] as any;
    const testSizeB = [0,1,2] as any;
    expect(c.isScreenSize(testSizeA)).toBe(false);
    expect(c.isScreenSize(testSizeB)).toBe(false);
  });

  test('invalid - array elements not numbers', () => {
    const testSize = ['a','b'] as any;
    expect(c.isScreenSize(testSize)).toBe(false);
  });

  test('valid', () => {
    const testSize = [10, 20] as any;
    expect(c.isScreenSize(testSize)).toBe(true);
  });
});

describe('test isValidSubjectConf', () => {
  test('invalid - type', () => {
    const testConf = null as any;
    expect(c.isValidSubjectConf(testConf)).toBe(false);
  });

  test('invalid - invalid props', () => {
    const testConf = {
      userId: 'tester',
      invalid: true
    } as any;
    expect(c.isValidSubjectConf(testConf)).toBe(false);
  });

  test('invalid - invalid screenResolution', () => {
    const testConf = {
      userId: 'tester',
      screenResolution: 10
    } as any;
    expect(c.isValidSubjectConf(testConf)).toBe(false);
  });

  test('invalid - invalid screenViewport', () => {
    const testConf = {
      userId: 'tester',
      screenViewport: [10,20,30]
    } as any;
    expect(c.isValidSubjectConf(testConf)).toBe(false);
  });

  test('valid screenViewport and screenResolution', () => {
    const testConf = {
      screenViewport: [10,20],
      screenResolution: [30,40]
    } as any;
    expect(c.isValidSubjectConf(testConf)).toBe(true);
  });

  test('valid', () => {
    const testConf = {
      'userId': 'tester',
      'networkUserId': '5d79770b-015b-4af8-8c91-b2ed6faf4b1e',
      'domainUserId': '5d79770b-015b-4af8-8c91-b2ed6faf4b1e',
      'useragent': 'agent string',
      'ipAddress': '0.0.0.0',
      'timezone': 'Europe/London',
      'language': 'en',
      'screenResolution': [123, 456],
      'screenViewport': [12, 34],
      'colorDepth': 0
    } as any;
    expect(c.isValidSubjectConf(testConf)).toBe(true);
  });
});

describe('test isValidGdprConf', () => {
  test('invalid - type', () => {
    const testConf = 'invalid' as any;
    expect(c.isValidGdprConf(testConf)).toBe(false);
  });

  test('invalid prop', () => {
    const testConf = {
      basisForProcessing: 'consent',
      documentId: '12345',
      documentVersion: '1.0.0',
      documentDescription: 'gdpr document description',
      invalid: true
    } as any;
    expect(c.isValidGdprConf(testConf)).toBe(false);
  });

  test('invalid prop - invalid basis', () => {
    const testConf = {
      basisForProcessing: 'invalid',
      documentId: '12345',
      documentVersion: '1.0.0',
      documentDescription: 'gdpr document description',
    } as any;
    expect(c.isValidGdprConf(testConf)).toBe(false);
  });

  test('invalid - missing prop', () => {
    const testConf = {
      basisForProcessing: 'consent',
      documentId: '12345',
      documentVersion: '1.0.0',
    } as any;
    expect(c.isValidGdprConf(testConf)).toBe(false);
  });

  test('valid', () => {
    const testConf = {
      basisForProcessing: 'consent',
      documentId: '12345',
      documentVersion: '1.0.0',
      documentDescription: 'gdpr document description',
    } as any;
    expect(c.isValidGdprConf(testConf)).toBe(true);
  });
});

describe('test isValidGCConf', () => {
  test('invalid - type', () => {
    const testConf = {'tag': 'invalid'} as any;
    expect(c.isValidGCConf(testConf)).toBe(false);
  });

  test('valid - empty array', () => {
    const testConf = [] as any;
    expect(c.isValidGCConf(testConf)).toBe(true);
  });

  test('invalid prop - invalid tag', () => {
    const testConf = [
      {
        tag: undefined,
        globalContexts: [
          {
            schema: 'testSchema',
            data: {test: 'data'}
          }
        ]
      }
    ] as any;
    expect(c.isValidGCConf(testConf)).toBe(false);
  });

  test('invalid prop - invalid globalContexts type', () => {
    const testConf = [
      {
        tag: undefined,
        globalContexts: {
          schema: 'testSchema',
          data: {test: 'data'}
        }
      }
    ] as any;
    expect(c.isValidGCConf(testConf)).toBe(false);
  });

  test('invalid prop - invalid globalContexts - invalid sdj', () => {
    const testConf = [
      {
        tag: 'testGCTag',
        globalContexts: [
          {
            data: {test: 'data'}
          }
        ]
      }
    ] as any;
    expect(c.isValidGCConf(testConf)).toBe(false);
  });

  test('valid', () => {
    const testConf = [
      {
        tag: 'testGCTag1',
        globalContexts: [
          {
            schema: 'testSchema0',
            data: {test: 'data'}
          },
          {
            schema: 'testSchema1',
            data: {test: 'data'}
          },
        ]
      },
      {
        tag: 'testGCTag2',
        globalContexts: [
          {
            schema: 'testSchema2',
            data: {test: 'data'}
          },
          {
            schema: 'testSchema3',
            data: {test: 'data'}
          },
        ]
      },
    ] as any;
    expect(c.isValidGCConf(testConf)).toBe(true);
  });
});
