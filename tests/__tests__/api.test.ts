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
import * as api from '../../src/api';

jest.mock('react-native');


describe('test createTracker', () => {
  test('test', async () => {
    const testInit = {
      namespace: 'sp1',
      networkConfig: {
        endpoint: 'test'
      }
    };
    const mockInitV = jest.spyOn(c, 'initValidate')
      .mockImplementation(() => Promise.resolve(true));

    await api.createTracker(testInit);
    expect(mockInitV).toHaveBeenCalledTimes(1);
  });
});
