require('dotenv').config();
const express = require('express');
const cors    = require('cors');
const helmet  = require('helmet');
const morgan  = require('morgan');
const path    = require('path');

const { testConnection } = require('./config/database');
const taskRoutes = require('./routes/task.routes');
const { metricsMiddleware, metricsRoute } = require('./middleware/metrics');

const app = express();

// ── Security & parsing ────────────────────────────────────────────────────────
app.use(helmet({ contentSecurityPolicy: false })); // CSP off so UI can load Google Fonts
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// ── Logging ───────────────────────────────────────────────────────────────────
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
}

// ── Prometheus metrics ────────────────────────────────────────────────────────
app.use(metricsMiddleware);

// ── Serve static UI ───────────────────────────────────────────────────────────
app.use(express.static(path.join(__dirname, '..', 'public')));

// ── Health / readiness probes ─────────────────────────────────────────────────
app.get('/health', (req, res) => {
  res.json({ status: 'ok', uptime: process.uptime(), timestamp: new Date() });
});

app.get('/ready', async (req, res) => {
  try {
    await testConnection();
    res.json({ status: 'ready' });
  } catch {
    res.status(503).json({ status: 'not ready', reason: 'database unavailable' });
  }
});

// ── Metrics endpoint (scraped by Prometheus) ──────────────────────────────────
app.get('/metrics', metricsRoute);

// ── API routes ────────────────────────────────────────────────────────────────
app.use('/api/tasks', taskRoutes);

// ── 404 ───────────────────────────────────────────────────────────────────────
app.use((req, res) => res.status(404).json({ error: 'Route not found' }));

// ── Global error handler ──────────────────────────────────────────────────────
app.use((err, req, res, _next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal server error' });
});

module.exports = app;