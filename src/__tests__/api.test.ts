import * as c from '../configurations';
import * as api from '../api';

jest.mock('react-native');

describe('test createTracker', () => {
  test('test', async () => {
    const testInit = {
      namespace: 'sp1',
      networkConfig: {
        endpoint: 'test',
      },
    };
    const mockInitV = jest
      .spyOn(c, 'initValidate')
      .mockImplementation(() => Promise.resolve(true));

    await api.createTracker(testInit);
    expect(mockInitV).toHaveBeenCalledTimes(1);
  });
});
