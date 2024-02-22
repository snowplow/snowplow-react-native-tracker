import * as main from '../index';
import * as api from '../api';

jest.mock('../../src/api');

describe('test 0', () => {
  test('test 0 1', () => {
    const mockApi = api as jest.Mocked<typeof api>;

    main.createTracker('sp1', { endpoint: 'http://0.0.0.0:9090' });

    expect(mockApi.createTracker).toHaveBeenCalled();
  });
});
