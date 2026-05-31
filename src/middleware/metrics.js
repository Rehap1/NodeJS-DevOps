const client = require('prom-client');

// Default Node.js metrics (memory, CPU, event loop)
client.collectDefaultMetrics({ prefix: 'taskapi_' });

// Custom HTTP metrics
const httpRequestDuration = new client.Histogram({
  name:    'taskapi_http_request_duration_seconds',
  help:    'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5],
});

const httpRequestTotal = new client.Counter({
  name:    'taskapi_http_requests_total',
  help:    'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status_code'],
});

const metricsMiddleware = (req, res, next) => {
  if (req.path === '/metrics' || req.path === '/health') return next();

  const end = httpRequestDuration.startTimer();
  res.on('finish', () => {
    const labels = {
      method:      req.method,
      route:       req.route?.path || req.path,
      status_code: res.statusCode,
    };
    end(labels);
    httpRequestTotal.inc(labels);
  });
  next();
};

const metricsRoute = async (req, res) => {
  res.set('Content-Type', client.register.contentType);
  res.end(await client.register.metrics());
};

module.exports = { metricsMiddleware, metricsRoute };
