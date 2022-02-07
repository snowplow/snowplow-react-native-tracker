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

import * as Micro from './microHelpers.js';

describe('tests helper functions of helpers.js', () => {
  it('tests compare with null, numbers, strings, booleans', () => {
    // null
    expect(Micro.compare(null, null)).toBe(true);
    expect(Micro.compare(null, [])).toBe(false);
    expect(Micro.compare('not null', null)).toBe(false);

    // numbers
    expect(Micro.compare(1, 1)).toBe(true);
    expect(Micro.compare(2.3, 0)).toBe(false);

    // strings
    expect(Micro.compare('a', 'a')).toBe(true);
    expect(Micro.compare('a', 'ab')).toBe(false);
    expect(Micro.compare('', 'b')).toBe(false);

    // booleans
    expect(Micro.compare(false, false)).toBe(true);
    expect(Micro.compare(true, false)).toBe(false);
  });

  it('tests compare with arrays', () => {
    // arrays and nested arrays
    expect(Micro.compare([], [])).toBe(true);

    expect(Micro.compare([], [1, 2])).toBe(true);

    expect(Micro.compare([1, 2], [])).toBe(false);

    expect(Micro.compare([1, 2], [2])).toBe(false);

    expect(Micro.compare([1, 2], [2, 1])).toBe(true);

    expect(Micro.compare([1, 2, 3], [4, 2, 5, 3, 1, 6])).toBe(true);

    expect(Micro.compare([1, [2, 3], 4], [5, 4, [3, 2, 0], 0, 1])).toBe(true);
  });

  it('tests compare with objects', () => {
    expect(Micro.compare({}, {})).toBe(true);

    expect(Micro.compare({}, {a: 1})).toBe(true);

    expect(Micro.compare({a: 1}, {})).toBe(false);

    expect(
      Micro.compare(
        {
          a: 1,
          b: 2,
        },
        {
          a: 1,
          b: 3,
        },
      ),
    ).toBe(false);

    expect(
      Micro.compare(
        {
          a: 1,
          b: 2,
        },
        {
          b: 2,
          c: 3,
          a: 1,
        },
      ),
    ).toBe(true);
  });

  it('tests compare with arrays of objects', () => {
    // expected, actual
    let exp, act;

    exp = [
      {
        a: 1,
        b: 2,
      },
      {
        c: 3,
      },
    ];
    act = [
      {
        c: 3,
        e: 5,
      },
      {
        b: 2,
        a: 1,
      },
      {
        d: 4,
      },
    ];
    expect(Micro.compare(exp, act)).toBe(true);

    exp = [
      {
        a: 1,
        b: 2,
      },
      {
        c: 3,
      },
    ];
    act = [
      {
        c: 3,
        e: 5,
      },
      {
        b: 2,
        a: 2,
      },
    ];
    expect(Micro.compare(exp, act)).toBe(false);

    exp = [
      {
        a: 1,
      },
      {
        c: [
          {
            d: 4,
            e: {
              f: 6,
              g: [1, 2],
            },
          },
        ],
      },
    ];
    act = [
      {
        z: 10,
        c: [
          {
            e: {
              g: [3, 2, 1],
              f: 6,
              i: 2,
            },
            d: 4,
            h: 7,
          },
        ],
      },
      {
        a: 1,
      },
    ];
    expect(Micro.compare(exp, act)).toBe(true);
  });

  it('tests compare with nested objects', () => {
    // expected, actual
    let exp, act_1, act_2;

    exp = {
      a: {
        b: {
          c: [1, 2],
          d: 'test',
          e: 5,
        },
        f: 1,
      },
      aa: [
        {},
        {
          bb: 1,
          cc: {
            dd: {
              ee: {
                ff: 0,
              },
            },
          },
        },
        [
          [0, 1],
          {
            aaa: 'bbb',
            ccc: [
              {
                ddd: 3.14,
              },
            ],
          },
          0,
        ],
        true,
      ],
      last: 'thing',
    };

    // "innocent" diffs
    act_1 = {
      diff1: 0,
      a: {
        b: {
          c: [1, 2],
          diff2: 0,
          d: 'test',
          e: 5,
        },
        diff3: [0, 0, 0],
        f: 1,
      },
      aa: [
        {},
        ['diff41', 'diff42'],
        {
          bb: 1,
          cc: {
            dd: {
              ee: {
                ff: 0,
                diff6: 0,
              },
              diff7: {},
            },
          },
          diff8: 0,
        },
        [
          [0, 1],
          ['diff9'],
          {
            aaa: 'bbb',
            ccc: [
              {
                ddd: 3.14,
              },
            ],
          },
          0,
        ],
        true,
      ],
      last: 'thing',
      diff0: 'last',
    };

    // pi
    act_2 = {
      a: {
        b: {
          c: [1, 2],
          d: 'test',
          e: 5,
        },
        f: 1,
      },
      aa: [
        {},
        {
          bb: 1,
          cc: {
            dd: {
              ee: {
                ff: 0,
              },
            },
          },
        },
        [
          [0, 1],
          {
            aaa: 'bbb',
            ccc: [
              {
                ddd: 3.1415, // only diff with exp
              },
            ],
          },
          0,
        ],
        true,
      ],
      last: 'thing',
    };

    expect(Micro.compare(exp, act_1)).toBe(true);
    expect(Micro.compare(exp, act_2)).toBe(false);
  });
});
