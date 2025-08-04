// __tests__/waterDataController.test.js

// 1) Before anything else, replace `require('node-fetch')` with a simple mock function
jest.mock('node-fetch', () => jest.fn());
const fetch = require('node-fetch');

const { getWaterData } = require('../controllers/waterDataController');

describe('waterDataController.getWaterData', () => {
  let req, res, next;
  const OLD_ENV = process.env;

  beforeEach(() => {
    jest.clearAllMocks();
    // Provide a fake API key for URL construction
    process.env = { ...OLD_ENV, OPENWATER_API_KEY: 'fake-key' };

    req = { query: { cql: "station='XYZ'" } };
    res = { json: jest.fn() };
    next = jest.fn();
  });

  afterAll(() => {
    process.env = OLD_ENV;
  });

  it('constructs the correct URL, calls fetch, and returns JSON payload', async () => {
    const fakeData = { foo: 'bar' };
    // Mock fetch to resolve with an object whose .json() yields our fakeData
    fetch.mockResolvedValue({
      json: jest.fn().mockResolvedValue(fakeData)
    });

    await getWaterData(req, res, next);

    const expectedUrl =
      'https://www.openwaterdata.com/ws/get'
      + '?token=fake-key'
      + '&cql=' + encodeURIComponent("station='XYZ'");

    // 1) It should have called fetch with that URL
    expect(fetch).toHaveBeenCalledWith(expectedUrl);

    // 2) It should have returned the parsed JSON to res.json(...)
    expect(res.json).toHaveBeenCalledWith(fakeData);

    // 3) No error path, so next() should not be called
    expect(next).not.toHaveBeenCalled();
  });

  it('forwards any fetch errors to next()', async () => {
    const err = new Error('network down');
    fetch.mockRejectedValue(err);
    

    await getWaterData(req, res, next);

    // It should call next(err) and never res.json
    expect(next).toHaveBeenCalledWith(err);
    expect(res.json).not.toHaveBeenCalled();
  });
});
