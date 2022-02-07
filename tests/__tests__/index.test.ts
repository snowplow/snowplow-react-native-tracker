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

import * as main from '../../src/index';
import * as api from '../../src/api';

jest.mock('../../src/api');

describe('test 0', () => {
  test('test 0 1', () => {
    const mockApi = api as jest.Mocked<typeof api>;

    main.createTracker('sp1', {endpoint: 'http://0.0.0.0:9090'});

    expect(mockApi.createTracker).toHaveBeenCalled();
  });
});
