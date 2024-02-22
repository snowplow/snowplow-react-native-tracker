import * as u from '../utils';

describe('test isObject', () => {
  test('isObject', () => {
    expect(u.isObject(null)).toBe(false);
    expect(u.isObject(undefined)).toBe(false);
    expect(u.isObject([])).toBe(false);
    expect(u.isObject({})).toBe(true);
  });
});
