const mockTestConnection = jest.fn();

jest.mock('../config/database', () => ({
  testConnection: mockTestConnection,
  pool: {
    query: jest.fn(),
  },
}));

const request = require('supertest');
const app = require('../app');

describe('Application endpoints', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /health', () => {
    test('returns 200 and reports that the application is healthy', async () => {
      const response = await request(app).get('/health');

      expect(response.statusCode).toBe(200);
      expect(response.body).toEqual({
        status: 'ok',
        uptime: expect.any(Number),
        timestamp: expect.any(String),
      });
    });
  });

  describe('GET /ready', () => {
    test('returns 200 when PostgreSQL is available', async () => {
      mockTestConnection.mockResolvedValueOnce();

      const response = await request(app).get('/ready');

      expect(mockTestConnection).toHaveBeenCalledTimes(1);
      expect(response.statusCode).toBe(200);
      expect(response.body).toEqual({
        status: 'ready',
      });
    });

    test('returns 503 when PostgreSQL is unavailable', async () => {
      mockTestConnection.mockRejectedValueOnce(
        new Error('Database unavailable')
      );

      const response = await request(app).get('/ready');

      expect(mockTestConnection).toHaveBeenCalledTimes(1);
      expect(response.statusCode).toBe(503);
      expect(response.body).toEqual({
        status: 'not ready',
        reason: 'database unavailable',
      });
    });
  });

  describe('Unknown route', () => {
    test('returns 404 for a route that does not exist', async () => {
      const response = await request(app).get('/does-not-exist');

      expect(response.statusCode).toBe(404);
      expect(response.body).toEqual({
        error: 'Route not found',
      });
    });
  });
});